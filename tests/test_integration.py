import hashlib,json
from pathlib import Path
import pytest
from pydantic import ValidationError
from monitor import integration as bridge,store
from tests.test_api_store import call

@pytest.fixture
def bundle():
    digest=hashlib.sha256(b'external code fixture').hexdigest()
    return {'schema_version':'1.0','strategies':[{'strategy_id':'external.alpha','name':'External code fixture','version':'v1','code_ref':'git://user-owned-strategy/revision','code_sha256':digest,'declared_modes':['backtest','paper','live']}],'runs':[{'schema_version':'1.0','snapshot_id':'snap-1','run_id':'run-1','strategy_id':'external.alpha','strategy_version':'v1','code_sha256':digest,'sequence':1,'mode':'backtest','status':'running','as_of':'2026-11-04T10:00:00+09:00','metrics':[{'key':'custom','label':'Code-defined metric','value':0.12,'unit':'ratio'}],'risks':[{'key':'custom_limit','label':'Code-defined risk','state':'warning','value':4,'limit':5,'unit':'units'}],'orders':[{'order_id':'o1','symbol':'CUSTOM','side':'buy','order_type':'user-defined-routing','status':'accepted','quantity':1}]}]}

@pytest.fixture(autouse=True)
def isolate(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'runtime.db')


def test_round_trip_custom_policy_and_observation_history(bundle):
    assert bridge.import_bundle(bridge.Bundle.model_validate(bundle))['new_observations']==1
    assert bridge.import_bundle(bridge.Bundle.model_validate(bundle))['duplicate_observations']==1
    bundle['strategies']=[]
    bundle['runs'][0].update(snapshot_id='snap-2',sequence=2,status='completed')
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    state=bridge.state()
    assert state['runs'][0]['status']=='completed'
    assert state['runs'][0]['orders'][0]['order_type']=='user-defined-routing'
    assert len(bridge.observations('run-1'))==2
    assert state['execution_adapter']=='not_connected'


def test_same_snapshot_id_cannot_overwrite(bundle):
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['runs'][0]['status']='failed'
    with pytest.raises(bridge.Conflict):bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    assert bridge.state()['runs'][0]['status']=='running'


def test_reject_out_of_order_and_code_hash_changes(bundle):
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['runs'][0]['snapshot_id']='another'
    with pytest.raises(bridge.Conflict,match='out_of_order'):bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['runs'][0].update(sequence=2,code_sha256='0'*64)
    with pytest.raises(bridge.Conflict,match='code_hash'):bridge.import_bundle(bridge.Bundle.model_validate(bundle))


def test_atomic_import_rolls_back_artifact_when_observation_invalid(bundle):
    bundle['runs'][0]['strategy_id']='unknown'
    with pytest.raises(bridge.MissingArtifact):bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    assert bridge.state()['strategies']==[]


def test_code_is_metadata_and_never_executed(bundle,tmp_path):
    marker=tmp_path/'must-not-exist'
    bundle['strategies'][0]['code_ref']="__import__('pathlib').Path("+repr(str(marker))+").touch()"
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    assert not marker.exists()


def test_version_is_immutable(bundle):
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['strategies'][0]['code_sha256']='f'*64
    with pytest.raises(bridge.Conflict,match='artifact_version'):bridge.import_bundle(bridge.Bundle.model_validate(bundle))


def test_run_mode_and_time_cannot_change(bundle):
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['runs'][0].update(snapshot_id='snap-2',sequence=2,mode='live')
    with pytest.raises(bridge.Conflict,match='run_identity'):bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['runs'][0].update(mode='backtest',as_of='2026-01-01T00:00:00Z')
    with pytest.raises(bridge.Conflict,match='as_of'):bridge.import_bundle(bridge.Bundle.model_validate(bundle))


def test_schema_rejects_unknown_fields_nonfinite_and_naive_time(bundle):
    bundle['runs'][0]['execute_now']=True
    with pytest.raises(ValidationError):bridge.Bundle.model_validate(bundle)
    del bundle['runs'][0]['execute_now']
    bundle['runs'][0]['metrics'][0]['value']=float('inf')
    with pytest.raises(ValidationError):bridge.Bundle.model_validate(bundle)
    bundle['runs'][0]['metrics']=[]
    bundle['runs'][0]['as_of']='2026-11-04T00:00:00'
    with pytest.raises(ValidationError):bridge.Bundle.model_validate(bundle)


def test_private_api_and_agent_contract(bundle,monkeypatch):
    assert call('POST','/api/runtime/bundles',json=bundle).status_code==503
    monkeypatch.setenv('MONITOR_PASSWORD','test-only-password')
    assert call('POST','/api/runtime/bundles',json=bundle).status_code==401
    auth=('research','test-only-password')
    assert call('POST','/api/runtime/bundles',json=bundle,auth=auth).status_code==200
    assert len(call('GET','/api/runtime/state',auth=auth).json()['runs'])==1
    assert len(call('GET','/api/runtime/runs/run-1/observations',auth=auth).json()['observations'])==1
    assert call('GET','/api/runtime/contract',auth=auth).json()['purpose']=='external_strategy_monitoring'
    assert call('POST','/api/backtest',json={},auth=auth).status_code==410


def test_published_contract_matches_backend():
    assert json.loads(Path('schemas/strategy-runtime-v1.json').read_text())==bridge.contract()


def test_public_market_export_excludes_runtime_data(bundle,tmp_path):
    from monitor.recovery import export_public
    store.save({'mode':'live','as_of':'2026-11-04T00:00:00Z','events':[],'prices':{},'news':[],'sources':[]})
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    output=export_public(tmp_path/'public.json')
    assert 'external.alpha' not in json.dumps(output)
    assert 'runtime' not in output and 'orders' not in output


def test_client_never_allows_remote_cleartext_credentials():
    from monitor.client import MonitorClient
    with pytest.raises(ValueError):MonitorClient('http://remote.example')
    with pytest.raises(ValueError):MonitorClient('https://user:pass@remote.example')
    assert MonitorClient('http://localhost:8000').base_url=='http://localhost:8000'


def test_observations_cursor(bundle):
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    bundle['strategies']=[]
    bundle['runs'][0].update(snapshot_id='snap-2',sequence=2)
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    assert bridge.observations('run-1',after_sequence=1,limit=1)[0]['snapshot']['sequence']==2


def test_pages_never_publishes_private_runtime(bundle,tmp_path):
    from scripts.build_pages import build
    bridge.import_bundle(bridge.Bundle.model_validate(bundle))
    build(tmp_path/'site')
    public=json.loads((tmp_path/'site/assets/data/runtime-state.json').read_text())
    assert public['strategies']==[] and public['runs']==[]
    assert public['transport']=='github-pages'
