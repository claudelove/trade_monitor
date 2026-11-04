import json
import os
import sqlite3
from pathlib import Path

DB = Path(os.environ.get('MONITOR_DB', 'data/monitor.db'))


def connect():
    DB.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(DB, timeout=30)
    c.execute('PRAGMA journal_mode=WAL')
    c.execute('CREATE TABLE IF NOT EXISTS snapshots (mode TEXT PRIMARY KEY, payload TEXT NOT NULL)')
    return c


def load(mode='live'):
    with connect() as c:
        row = c.execute('SELECT payload FROM snapshots WHERE mode=?', (mode,)).fetchone()
    payload = json.loads(row[0]) if row else {'mode': mode, 'events': [], 'prices': {}, 'news': [], 'sources': [], 'as_of': None}
    from monitor.event_types import decorate
    payload['events'] = [decorate(e) for e in payload['events']]
    return payload


def save(payload):
    with connect() as c:
        c.execute('INSERT OR REPLACE INTO snapshots VALUES (?,?)', (payload['mode'], json.dumps(payload, ensure_ascii=False)))


def save_live(payload):
    previous = load('live')
    statuses = {s['name']: s for s in payload['sources']}
    old_statuses = {s['name']: s for s in previous['sources']}
    for source, field, identity in [('DART','events','id'), ('뉴스 RSS','news','url')]:
        status = statuses.get(source, {})
        if status.get('state') == 'blocked':
            payload[field] = previous.get(field, [])
        else:
            merged = {row[identity]: row for row in previous.get(field, [])}
            merged.update({row[identity]: row for row in payload[field]})
            payload[field] = list(merged.values())
            if field == 'news':
                payload[field] = sorted(payload[field], key=lambda r:r['published_at'], reverse=True)[:300]
    merged_prices = dict(previous.get('prices', {}))
    for ticker, rows in payload['prices'].items():
        merged = {r['date']: r for r in merged_prices.get(ticker, [])}
        merged.update({r['date']: r for r in rows})
        merged_prices[ticker] = sorted(merged.values(), key=lambda r:r['date'])
    payload['prices'] = merged_prices
    for name, status in statuses.items():
        if status.get('state') == 'blocked' and name in old_statuses:
            status['last_success_at'] = old_statuses[name].get('last_success_at') or old_statuses[name].get('collected_at')
            if status['last_success_at']:
                status['detail'] += ' · 이전 캐시 유지: ' + status['last_success_at']
        elif status.get('state') == 'ok':
            status['last_success_at'] = status['collected_at']
    save(payload)
    return payload
