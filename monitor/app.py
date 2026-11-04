import asyncio
import datetime as dt
import re
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from monitor import store
from monitor.demo import generate
from monitor.providers.live import collect, news
from monitor.event_types import EVENT_TYPES
from monitor import integration
from monitor.auth import AccessGate

@asynccontextmanager
async def lifespan(app):
    if os.environ.get('MONITOR_REQUIRE_AUTH') == '1' and not os.environ.get('MONITOR_PASSWORD'):
        raise RuntimeError('MONITOR_PASSWORD is required in hosted mode')
    bootstrap = os.environ.get('MONITOR_BOOTSTRAP')
    if bootstrap:
        from monitor.recovery import restore_if_empty
        restore_if_empty(Path(bootstrap))
    yield


app = FastAPI(title='Catalyst | Markets & Operations', version='0.1.0', lifespan=lifespan)
app.add_middleware(AccessGate)
WEB = Path(__file__).resolve().parent.parent / 'web'
app.mount('/assets', StaticFiles(directory=WEB), name='assets')
running = False


def snapshot(mode):
    if mode == 'demo':
        payload = store.load('demo')
        if not payload['events']:
            payload = generate()
            store.save(payload)
        return payload
    return store.load('live')


@app.get('/')
async def index():
    return FileResponse(WEB / 'index.html')


@app.get('/api/health')
async def health():
    return {'status': 'ok', 'refreshing': running}


@app.get('/healthz', include_in_schema=False)
async def public_health():
    return {'status': 'ok'}


@app.get('/api/snapshot')
async def get_snapshot(mode: Literal['live','demo']='live'):
    data = snapshot(mode)
    data['event_types'] = EVENT_TYPES
    data['strategies'] = EVENT_TYPES # Legacy read-only field
    return data


@app.get('/api/event/{event_id}')
async def event_detail(event_id: str, mode: Literal['live','demo']='live', benchmark: str='069500'):
    data = snapshot(mode)
    event = next((e for e in data['events'] if e['id'] == event_id), None)
    if not event:
        raise HTTPException(404, '이벤트 없음')
    return {'event': event}


@app.post('/api/event/{event_id}/news')
async def fetch_event_news(event_id: str):
    global running
    if running:
        raise HTTPException(409, '다른 수집 진행 중')
    data = store.load('live')
    event = next((e for e in data['events'] if e['id'] == event_id), None)
    if not event:
        raise HTTPException(404, '실데이터 이벤트 없음')
    running = True
    try:
        start = dt.date.fromisoformat(event['date']) - dt.timedelta(days=3)
        end = dt.date.fromisoformat(event['date']) + dt.timedelta(days=15)
        items = await asyncio.to_thread(news, f'"{event["company"]}" after:{start} before:{end}')
        for item in items:
            item['event_id'] = event_id
        data['news'] = data['news'] + items
        status = {'name':'뉴스 RSS','state':'ok' if items else 'empty','detail':f'기업·이벤트 기간 검색 {len(items)}건', 'collected_at':dt.datetime.now(dt.timezone.utc).isoformat()}
        data['sources'] = [s for s in data['sources'] if s['name'] != '뉴스 RSS'] + [status]
        store.save_live(data)
        return {'items':items}
    except Exception:
        raise HTTPException(502, '뉴스 공급자 응답 실패') from None
    finally:
        running = False


class Refresh(BaseModel):
    start: dt.date
    end: dt.date
    tickers: list[str] = Field(default=['005930','000660','035420','005380','105560','069500'], min_length=1, max_length=12)
    query: str = Field(default='한국 기업 자사주 공개매수 실적', min_length=1, max_length=150)


@app.post('/api/refresh')
async def refresh(args: Refresh):
    global running
    if args.end < args.start or (args.end-args.start).days > 120 or any(not re.fullmatch(r'[0-9A-Z]{6}', x) for x in args.tickers):
        raise HTTPException(422, '날짜 범위는 0~120일, 종목코드는 영문 대문자·숫자 6자리여야 합니다.')
    if running:
        raise HTTPException(409, '수집 진행 중')
    running = True
    try:
        data = await asyncio.to_thread(collect, args.start.isoformat(), args.end.isoformat(), list(dict.fromkeys(args.tickers)), args.query)
        store.save_live(data)
        return {'sources': data['sources'], 'as_of': data['as_of']}
    finally:
        running = False


@app.post('/api/backtest')
async def retired_backtest():
    raise HTTPException(410, '내장 이벤트 전략 실행기는 종료했습니다. 외부 전략 실행 결과를 /api/runtime/bundles로 전달하세요.')


@app.get('/api/runtime/contract')
async def runtime_contract():
    return integration.contract()


@app.get('/api/runtime/state')
async def runtime_state():
    return integration.state()


@app.post('/api/runtime/bundles')
async def runtime_import(bundle: integration.Bundle):
    if not os.environ.get('MONITOR_PASSWORD'):
        raise HTTPException(503, 'runtime_write_requires_configured_authentication')
    try:
        return integration.import_bundle(bundle)
    except integration.MissingArtifact as exc:
        raise HTTPException(422, str(exc)) from None
    except integration.Conflict as exc:
        raise HTTPException(409, str(exc)) from None


@app.get('/api/runtime/runs/{run_id}/observations')
async def runtime_observations(run_id: str,after_sequence: int=Query(0,ge=0),limit: int=Query(100,ge=1,le=500)):
    return {'run_id':run_id,'observations':integration.observations(run_id,after_sequence,limit)}


@app.get('/api/runtime/example')
async def runtime_example():
    return FileResponse(WEB.parent/'schemas/strategy-runtime-example.json',media_type='application/json')
