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
    if output.resolve() == ROOT.resolve() or output.is_symlink():
        raise ValueError('Unsafe output directory')
    if output.exists() and any(output.iterdir()):
        if not (output/'.nojekyll').is_file():
            raise ValueError('Refusing to replace a directory not marked as a generated Pages build')
        shutil.rmtree(output)
    assets = output / 'assets'
    data = assets / 'data'
    data.mkdir(parents=True, exist_ok=True)
    from scripts.sync_screens import sync
    sync(check=True)
    for source in (ROOT/'web').rglob('*'):
        if source.is_file() and source.suffix in {'.js','.css','.svg','.woff2'}:
            if source.is_symlink() or any(part.startswith('.') for part in source.relative_to(ROOT/'web').parts):
                raise ValueError('Public assets must be regular, non-hidden files')
            target=assets/source.relative_to(ROOT/'web')
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(source,target)
    html = (ROOT/'web/index.html').read_text()
    html = html.replace('<html lang="en">','<html lang="en" data-hosting="pages">')
    html = html.replace('href="/"','href="./"').replace('="/assets/','="./assets/')
    (output/'index.html').write_text(html)
    shutil.copytree(ROOT/'third_party',output/'third_party',dirs_exist_ok=True)
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
