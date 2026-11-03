"""Export public market records and seed an empty DB; never export environment."""
import argparse
import json
import os
from pathlib import Path
from monitor import store

FIELDS = {
    'event': ('id','ticker','company','title','date','available_at','time_precision','url','source','observed_at'),
    'bar': ('date','open','high','low','close','volume','value','value_estimated','source','adjusted'),
    'news': ('title','url','published_at','publisher','source','query','match','event_id'),
    'status': ('name','state','detail','truncated','collected_at','last_success_at'),
}


def select(row, kind):
    return {k: row[k] for k in FIELDS[kind] if k in row}


def export_public(path):
    data = store.load('live')
    output = {'schema_version':1, 'mode':'live', 'as_of':data['as_of'],
              'events':[select(e,'event') for e in data['events']],
              'prices':{t:[select(r,'bar') for r in rows] for t,rows in data['prices'].items()},
              'news':[select(n,'news') for n in data['news']],
              'sources':[select(s,'status') for s in data['sources']]}
    text = json.dumps(output, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    for name in ('DART_API_KEY','KRX_PW','MONITOR_PASSWORD','RENDER_API_KEY','GITHUB_TOKEN','GH_TOKEN'):
        value = os.environ.get(name)
        if value and value in text:
            raise ValueError('Credential detected; export refused')
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_text(text)
    temporary.replace(path)
    return output


def restore_if_empty(path):
    with store.connect() as c:
        if c.execute('SELECT 1 FROM snapshots WHERE mode=?', ('live',)).fetchone():
            return False
        payload = json.loads(path.read_text())
        if payload.get('schema_version') != 1 or payload.get('mode') != 'live' or not isinstance(payload.get('events'),list) or not isinstance(payload.get('prices'),dict):
            raise ValueError('Unsupported bootstrap snapshot')
        payload['restored_from_snapshot'] = True
        for source in payload.get('sources', []):
            source['detail'] = 'Git 기준 스냅샷 복원 · ' + source.get('detail','')
        # Same transaction: a concurrent initializer must not overwrite a live DB.
        c.execute('INSERT OR IGNORE INTO snapshots VALUES (?,?)', ('live',json.dumps(payload,ensure_ascii=False)))
    return True


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['export','restore'])
    parser.add_argument('--path', type=Path, default=Path('fixtures/bootstrap-live.json'))
    args = parser.parse_args()
    if args.action == 'export':
        data = export_public(args.path)
        print(json.dumps({'exported':str(args.path), 'events':len(data['events']), 'price_tickers':len(data['prices']), 'news':len(data['news'])}))
    else:
        print(json.dumps({'restored':restore_if_empty(args.path)}))
