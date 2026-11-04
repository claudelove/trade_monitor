import asyncio
import httpx
from monitor import store
from monitor.app import app
from monitor.demo import generate


def call(method, path, **kwargs):
    async def request():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as client:
            return await client.request(method,path,**kwargs)
    return asyncio.run(request())


def test_api_mode_validation_and_data_isolation(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'test.db')
    assert call('GET','/api/health').status_code==200
    live=call('GET','/api/snapshot').json()
    demo=call('GET','/api/snapshot?mode=demo').json()
    assert live['events']==[]
    assert demo['mode']=='demo' and len(demo['events'])==49
    assert call('GET','/api/snapshot?mode=invalid').status_code==422
    assert call('GET','/api/event/missing').status_code==404
    assert call('POST','/api/backtest',json={'holding':0}).status_code==410
    assert call('POST','/api/refresh',json={'start':'2026-01-01','end':'2026-01-02','tickers':['../bad']}).status_code==422
    r=call('POST','/api/backtest',json={'mode':'demo','strategy':'buyback','holding':5})
    assert r.status_code==410
    assert call('GET','/api/snapshot?mode=live').json()['prices']=={}


def test_store_accumulates_and_keeps_failed_feed_timestamp(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'test.db')
    event_a={'id':'a','title':'자기주식취득결정'}
    event_b={'id':'b','title':'유상증자결정'}
    a={'mode':'live','as_of':'first','events':[event_a],'news':[],'prices':{'005930':[{'date':'2026-01-01'}]},'sources':[{'name':'DART','state':'ok','collected_at':'first'}]}
    store.save_live(a)
    b={'mode':'live','as_of':'second','events':[],'news':[],'prices':{},'sources':[{'name':'DART','state':'blocked','detail':'network'}]}
    store.save_live(b)
    current=store.load('live')
    assert [e['id'] for e in current['events']]==['a']
    assert current['sources'][0]['last_success_at']=='first'
    c={'mode':'live','as_of':'third','events':[event_b],'news':[],'prices':{'005930':[{'date':'2026-01-02'}]},'sources':[{'name':'DART','state':'ok','collected_at':'third'}]}
    store.save_live(c)
    assert len(store.load('live')['events'])==2
    assert len(store.load('live')['prices']['005930'])==2


def test_optional_access_gate(monkeypatch):
    monkeypatch.setenv('MONITOR_PASSWORD','test-only-password')
    assert call('GET','/api/health').status_code==401
    assert call('GET','/api/health',auth=('research','wrong')).status_code==401
    assert call('GET','/api/health',auth=('research','test-only-password')).status_code==200
