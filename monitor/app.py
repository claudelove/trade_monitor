import asyncio
import datetime as dt
import re
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from monitor import store
from monitor.demo import generate
from monitor.providers.live import collect, news
from monitor.strategies import STRATEGIES
from monitor.analytics import study, backtest
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


app = FastAPI(title='Catalyst | Event Research', version='0.1.0', lifespan=lifespan)
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
    data['strategies'] = STRATEGIES
    return data


@app.get('/api/event/{event_id}')
async def event_detail(event_id: str, mode: Literal['live','demo']='live', benchmark: str='069500'):
    data = snapshot(mode)
    event = next((e for e in data['events'] if e['id'] == event_id), None)
    if not event:
        raise HTTPException(404, '이벤트 없음')
    return {'event': event, 'study': study(event, data['prices'], benchmark)}


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


class Backtest(BaseModel):
    mode: Literal['live','demo'] = 'live'
    strategy: str = 'buyback'
    holding: int = Field(default=5, ge=1, le=60)
    cost_bps: float = Field(default=20, ge=0, le=500)
    min_value: float = Field(default=0, ge=0)
    start: dt.date | None = None
    end: dt.date | None = None


@app.post('/api/backtest')
async def run_backtest(args: Backtest):
    if args.strategy not in STRATEGIES or (args.start and args.end and args.start > args.end):
        raise HTTPException(422, '전략 또는 기간 확인 필요')
    return backtest(snapshot(args.mode), args.strategy, args.holding, args.cost_bps, args.min_value, args.start.isoformat() if args.start else None, args.end.isoformat() if args.end else None)
