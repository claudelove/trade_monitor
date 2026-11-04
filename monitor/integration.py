"""Versioned observation boundary for external strategy runtimes; executes no code."""
import argparse
import datetime as dt
import json
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, AwareDatetime, field_validator
from monitor import store

ID = r'^[A-Za-z0-9_.:-]+$'
SHA = r'^[a-f0-9]{64}$'

class Record(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)

class Artifact(Record):
    strategy_id: str = Field(min_length=1,max_length=100,pattern=ID)
    name: str = Field(min_length=1,max_length=160)
    version: str = Field(min_length=1,max_length=100)
    code_ref: str = Field(min_length=1,max_length=1000)
    code_sha256: str = Field(pattern=SHA)
    declared_modes: list[Literal['backtest','paper','live']] = Field(default_factory=list,max_length=3)
    description: str = Field(default='',max_length=4000)

class Metric(Record):
    key: str = Field(min_length=1,max_length=100)
    label: str = Field(min_length=1,max_length=160)
    value: float | str | None
    unit: str | None = Field(default=None,max_length=40)

class Risk(Record):
    key: str = Field(min_length=1,max_length=100)
    label: str = Field(min_length=1,max_length=160)
    state: Literal['ok','warning','breached','unknown']
    value: float | None = None
    limit: float | None = None
    unit: str | None = Field(default=None,max_length=40)

class Order(Record):
    order_id: str = Field(min_length=1,max_length=160)
    symbol: str = Field(min_length=1,max_length=100)
    side: Literal['buy','sell']
    order_type: str = Field(min_length=1,max_length=100)
    status: str = Field(min_length=1,max_length=100)
    quantity: float = Field(ge=0)
    filled_quantity: float = Field(default=0,ge=0)
    limit_price: float | None = Field(default=None,ge=0)

class Fill(Record):
    fill_id: str = Field(min_length=1,max_length=160)
    order_id: str = Field(min_length=1,max_length=160)
    symbol: str = Field(min_length=1,max_length=100)
    side: Literal['buy','sell']
    quantity: float = Field(gt=0)
    price: float = Field(ge=0)
    at: AwareDatetime

class Position(Record):
    symbol: str = Field(min_length=1,max_length=100)
    quantity: float
    average_price: float | None = Field(default=None,ge=0)
    market_value: float | None = None
    currency: str = Field(default='',max_length=20)

class EquityPoint(Record):
    at: AwareDatetime
    equity: float

class Log(Record):
    at: AwareDatetime
    level: Literal['debug','info','warning','error']
    message: str = Field(max_length=4000)

class RunSnapshot(Record):
    schema_version: Literal['1.0'] = '1.0'
    snapshot_id: str = Field(min_length=1,max_length=160,pattern=ID)
    run_id: str = Field(min_length=1,max_length=160,pattern=ID)
    strategy_id: str = Field(min_length=1,max_length=100,pattern=ID)
    strategy_version: str = Field(min_length=1,max_length=100)
    code_sha256: str = Field(pattern=SHA)
    sequence: int = Field(ge=1)
    mode: Literal['backtest','paper','live']
    status: Literal['created','running','paused','completed','failed','stopped']
    as_of: AwareDatetime
    metrics: list[Metric] = Field(default_factory=list,max_length=200)
    risks: list[Risk] = Field(default_factory=list,max_length=200)
    positions: list[Position] = Field(default_factory=list,max_length=2000)
    orders: list[Order] = Field(default_factory=list,max_length=5000)
    fills: list[Fill] = Field(default_factory=list,max_length=5000)
    equity: list[EquityPoint] = Field(default_factory=list,max_length=10000)
    logs: list[Log] = Field(default_factory=list,max_length=1000)
    data_snapshot_id: str | None = Field(default=None,max_length=200)
    @field_validator('as_of')
    @classmethod
    def normalize_time(cls,value):return value.astimezone(dt.timezone.utc)

class Bundle(Record):
    schema_version: Literal['1.0'] = '1.0'
    strategies: list[Artifact] = Field(default_factory=list,max_length=500)
    runs: list[RunSnapshot] = Field(default_factory=list,max_length=1000)

class Conflict(ValueError):pass
class MissingArtifact(ValueError):pass


def connect():
    c=store.connect()
    c.execute('CREATE TABLE IF NOT EXISTS runtime_artifacts (strategy_id TEXT, version TEXT, payload TEXT NOT NULL, PRIMARY KEY(strategy_id,version))')
    c.execute('CREATE TABLE IF NOT EXISTS runtime_runs (run_id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
    c.execute('CREATE TABLE IF NOT EXISTS runtime_observations (snapshot_id TEXT PRIMARY KEY, run_id TEXT NOT NULL, sequence INTEGER NOT NULL, payload TEXT NOT NULL, received_at TEXT NOT NULL, UNIQUE(run_id,sequence))')
    c.commit()
    return c


def canonical(model):return json.dumps(model.model_dump(mode='json'),sort_keys=True,ensure_ascii=False,allow_nan=False)


def register(c,artifact):
    payload=canonical(artifact)
    old=c.execute('SELECT payload FROM runtime_artifacts WHERE strategy_id=? AND version=?',(artifact.strategy_id,artifact.version)).fetchone()
    if old:
        if old[0]!=payload:raise Conflict('artifact_version_immutable')
        return False
    c.execute('INSERT INTO runtime_artifacts VALUES (?,?,?)',(artifact.strategy_id,artifact.version,payload))
    return True


def ingest(c,run):
    payload=canonical(run)
    old=c.execute('SELECT payload FROM runtime_observations WHERE snapshot_id=?',(run.snapshot_id,)).fetchone()
    if old:
        if old[0]!=payload:raise Conflict('snapshot_id_reused_with_different_payload')
        return False
    artifact=c.execute('SELECT payload FROM runtime_artifacts WHERE strategy_id=? AND version=?',(run.strategy_id,run.strategy_version)).fetchone()
    if not artifact:raise MissingArtifact('register_artifact_first')
    if json.loads(artifact[0])['code_sha256']!=run.code_sha256:raise Conflict('code_hash_mismatch')
    latest=c.execute('SELECT payload FROM runtime_runs WHERE run_id=?',(run.run_id,)).fetchone()
    if latest:
        previous=RunSnapshot.model_validate_json(latest[0])
        if (previous.strategy_id,previous.strategy_version,previous.code_sha256,previous.mode)!=(run.strategy_id,run.strategy_version,run.code_sha256,run.mode):raise Conflict('run_identity_immutable')
        if run.sequence<=previous.sequence:raise Conflict('out_of_order_sequence')
        if run.as_of<previous.as_of:raise Conflict('as_of_must_not_go_backwards')
    now=dt.datetime.now(dt.timezone.utc).isoformat()
    c.execute('INSERT INTO runtime_observations VALUES (?,?,?,?,?)',(run.snapshot_id,run.run_id,run.sequence,payload,now))
    c.execute('INSERT OR REPLACE INTO runtime_runs VALUES (?,?)',(run.run_id,payload))
    return True


def import_bundle(bundle):
    # Append observations and update latest state in one transaction.
    with connect() as c:
        c.execute('BEGIN IMMEDIATE')
        artifacts=sum(register(c,a) for a in bundle.strategies)
        observations=sum(ingest(c,r) for r in bundle.runs)
    return {'registered_artifacts':artifacts,'new_observations':observations,'duplicate_observations':len(bundle.runs)-observations}


def state():
    with connect() as c:
        artifacts=[json.loads(r[0]) for r in c.execute('SELECT payload FROM runtime_artifacts ORDER BY strategy_id,version')]
        runs=[json.loads(r[0]) for r in c.execute('SELECT payload FROM runtime_runs')]
    runs.sort(key=lambda r:dt.datetime.fromisoformat(r['as_of'].replace('Z','+00:00')),reverse=True)
    return {'schema_version':'1.0','strategies':artifacts,'runs':runs,'execution_control':'external_runtime','execution_adapter':'not_connected','transport':'private_backend'}


def observations(run_id,after_sequence=0,limit=100):
    with connect() as c:
        return [{'snapshot':json.loads(p),'received_at':t} for p,t in c.execute('SELECT payload,received_at FROM runtime_observations WHERE run_id=? AND sequence>? ORDER BY sequence LIMIT ?',(run_id,after_sequence,limit))]


def contract():
    return {'schema_version':'1.0','purpose':'external_strategy_monitoring','execution_control':'external_runtime','execution_adapter':'not_connected','strategy_execution_abi':'pending_user_documentation','artifact_verification':'reported_hash_only','observation_format':'complete_run_snapshot','ownership':{'external_code':['signals','risk_policy','execution','order_routing','backtesting'],'dashboard':['artifact_identity','observation_history','monitoring','agent_read_api']},'bundle_schema':Bundle.model_json_schema(),'endpoints':[{'method':'GET','path':'/api/runtime/contract'},{'method':'GET','path':'/api/runtime/example'},{'method':'GET','path':'/api/runtime/state'},{'method':'POST','path':'/api/runtime/bundles'},{'method':'GET','path':'/api/runtime/runs/{run_id}/observations'}]}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description='External strategy observation adapter; never executes code')
    parser.add_argument('action',choices=['schema','state','validate','import'])
    parser.add_argument('--path',type=Path)
    args=parser.parse_args()
    if args.action=='schema':result=contract()
    elif args.action=='state':result=state()
    else:
        if not args.path:parser.error('--path is required')
        bundle=Bundle.model_validate_json(args.path.read_text())
        result=import_bundle(bundle) if args.action=='import' else {'valid':True,'strategies':len(bundle.strategies),'observations':len(bundle.runs)}
    print(json.dumps(result,ensure_ascii=False,allow_nan=False))
