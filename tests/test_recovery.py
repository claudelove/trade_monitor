import asyncio
import json
import pytest
from monitor import store
from monitor.app import app
from monitor.recovery import export_public, restore_if_empty
from tests.test_api_store import call


def test_public_health_is_minimal_while_app_remains_private(monkeypatch):
    monkeypatch.setenv('MONITOR_PASSWORD','test-only-password')
    assert call('GET','/healthz').json()=={'status':'ok'}
    assert call('GET','/api/snapshot').status_code==401
    assert call('GET','/api/health').status_code==401


def test_bootstrap_restores_without_key_and_never_overwrites(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'data'/'monitor.db')
    monkeypatch.delenv('DART_API_KEY',raising=False)
    path=tmp_path/'seed.json'
    seed={'schema_version':1,'mode':'live','as_of':'2026-11-03T00:00:00+00:00','events':[],'prices':{},'news':[],'sources':[{'name':'DART','state':'ok','detail':'baseline'}]}
    path.write_text(json.dumps(seed))
    assert restore_if_empty(path)
    restored=store.load('live')
    assert restored['as_of']==seed['as_of']
    assert restored['restored_from_snapshot']
    restored['as_of']='new data'
    store.save(restored)
    assert not restore_if_empty(path)
    assert store.load('live')['as_of']=='new data'


def test_export_allowlists_fields_and_refuses_secret_content(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'db')
    seed={'mode':'live','as_of':'old','events':[{'id':'e','title':'自社株','private_note':'excluded'}],'prices':{},'news':[],'sources':[], 'private_config':'excluded'}
    store.save(seed)
    path=tmp_path/'export.json'
    output=export_public(path)
    assert 'private_config' not in output
    assert 'private_note' not in output['events'][0]
    monkeypatch.setenv('DART_API_KEY','fake-secret-used-only-by-test')
    seed['events'][0]['title']='fake-secret-used-only-by-test'
    store.save(seed)
    with pytest.raises(ValueError,match='Credential detected'):
        export_public(tmp_path/'refused.json')
    assert not (tmp_path/'refused.json').exists()


def test_hosted_startup_requires_password_and_bootstraps(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'db')
    monkeypatch.setenv('MONITOR_REQUIRE_AUTH','1')
    monkeypatch.delenv('MONITOR_PASSWORD',raising=False)
    async def startup():
        async with app.router.lifespan_context(app):
            pass
    with pytest.raises(RuntimeError,match='MONITOR_PASSWORD is required'):
        asyncio.run(startup())
    monkeypatch.setenv('MONITOR_PASSWORD','test-only-password')
    monkeypatch.setenv('MONITOR_BOOTSTRAP','fixtures/bootstrap-live.json')
    asyncio.run(startup())
    assert len(store.load('live')['events'])==502
    asyncio.run(startup())
    assert len(store.load('live')['events'])==502


def test_reject_unsupported_bootstrap(tmp_path,monkeypatch):
    monkeypatch.setattr(store,'DB',tmp_path/'db')
    path=tmp_path/'bad.json'
    path.write_text('{"schema_version":99}')
    with pytest.raises(ValueError,match='Unsupported bootstrap'):
        restore_if_empty(path)
