"""Build GitHub Pages assets from the public market snapshot, without secrets."""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from monitor.demo import generate
from monitor.event_types import EVENT_TYPES, decorate

def build(output):
    output = Path(output)
    assets = output / 'assets'
    data = assets / 'data'
    data.mkdir(parents=True, exist_ok=True)
    for filename in ('app.js','style.css','analytics.js','static-api.js','runtime-ui.js','runtime-contract.js','terminal-ui.js','window-workspace.js','native-report.js'):
        shutil.copyfile(ROOT/'web'/filename, assets/filename)
    html = (ROOT/'web/index.html').read_text()
    html = html.replace('<html lang="ko">','<html lang="ko" data-hosting="pages">')
    html = html.replace('href="/"','href="./"').replace('="/assets/','="./assets/')
    (output/'index.html').write_text(html)
    live = json.loads((ROOT/'fixtures/bootstrap-live.json').read_text())
    if live.get('schema_version') != 1 or live.get('mode') != 'live':
        raise ValueError('Unsupported public snapshot')
    live['events'] = [decorate(e) for e in live['events']]
    for mode, payload in [('live',live),('demo',generate())]:
        payload['event_types'] = EVENT_TYPES
        payload['strategies'] = EVENT_TYPES
        payload['hosting'] = 'github-pages'
        (data/(mode+'.json')).write_text(json.dumps(payload,ensure_ascii=False,allow_nan=False))
    shutil.copyfile(ROOT/'schemas/strategy-runtime-v1.json',data/'runtime-contract.json')
    shutil.copyfile(ROOT/'schemas/strategy-runtime-example.json',data/'runtime-example.json')
    (data/'runtime-state.json').write_text(json.dumps({'schema_version':'1.0','strategies':[],'runs':[],'execution_control':'external_runtime','execution_adapter':'not_connected','transport':'github-pages'}))
    revision = subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    (output/'version.json').write_text(json.dumps({'commit':revision,'hosting':'github-pages'}))
    (output/'.nojekyll').touch()
    return {'output':str(output),'commit':revision,'events':len(live['events']),'price_tickers':len(live['prices'])}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=ROOT/'dist')
    print(json.dumps(build(parser.parse_args().output)))
