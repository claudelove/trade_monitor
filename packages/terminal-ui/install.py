#!/usr/bin/env python3
"""Install/check a pinned, screen-independent UI bundle. No engine/API edits or runtime CDN."""
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import posixpath
import re
import shutil
import subprocess
import tarfile
import tempfile
import urllib.request

PROVIDER = 'claudelove/trade_monitor'
PACKAGE = 'packages/terminal-ui'
API_VERSION = 1
COMPAT = {'style.css','ui/tokens.css','ui/shell.css','ui/panels.css','charts/chart.css','charts/model.js','charts/native-chart.js','charts/native-series.js','charts/svg-chart.js','charts/terminal-chart.js','charts/vendor/lightweight-charts.js','ui/theme.js','ui/window-actions.js','ui/dom.js','ui/fonts/ibm-plex-mono-latin-400-normal.woff2','ui/fonts/ibm-plex-mono-latin-600-normal.woff2'}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def relative(value):
    path = PurePosixPath(value)
    if not value or not path.parts or path.is_absolute() or any(p in {'..', '.', '.git'} for p in path.parts) or '\\' in value:
        raise ValueError('Unsafe bundle path')
    return path

def load_package(source):
    manifest_bytes = (source/'manifest.json').read_bytes()
    manifest = json.loads(manifest_bytes)
    if manifest.get('api_version') != API_VERSION:
        raise ValueError('UI contract major version requires an explicit adapter migration')
    for name, expected in manifest['files'].items():
        path = source/relative(name)
        if path.is_symlink() or not path.is_file() or digest(path.read_bytes()) != expected:
            raise ValueError('Bundle hash mismatch: '+name)
    if digest((source/'install.py').read_bytes()) != manifest['files']['install.py']:
        raise ValueError('Installer hash mismatch')
    return manifest, digest(manifest_bytes)

def remote_package(revision, temporary):
    if not re.fullmatch('[0-9a-f]{40}', revision or ''):
        raise ValueError('Use a full 40-character public commit SHA, never a moving branch')
    url = f'https://api.github.com/repos/{PROVIDER}/tarball/{revision}'
    with urllib.request.urlopen(url, timeout=60) as response:
        data = response.read(32*1024*1024+1)
    if len(data) > 32*1024*1024:
        raise ValueError('Public source archive is too large')
    target = temporary/'package';target.mkdir()
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        members = archive.getmembers()
        prefixes = {m.name.split('/')[0] for m in members}
        if len(prefixes) != 1:
            raise ValueError('Unexpected source archive')
        prefix = next(iter(prefixes))+'/'+PACKAGE+'/'
        for member in members:
            if not member.name.startswith(prefix) or member.isdir():
                continue
            if not member.isfile() or member.size > 4*1024*1024:
                raise ValueError('Unsupported archive entry')
            dest = target/relative(member.name[len(prefix):]);dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(archive.extractfile(member).read())
    return target

def web_root(repo):
    public = repo/'web'
    private = repo/'src/krx_system/monitoring/web'
    choices = [p for p in (public, private) if (p/'index.html').is_file()]
    if len(choices) != 1:
        raise ValueError('Expected exactly one supported terminal frontend')
    return choices[0]

def wrapper(target, spec):
    src = posixpath.relpath('shared/'+spec['source'], str(PurePosixPath(target).parent))
    if not src.startswith('.'):
        src = './'+src
    if spec['kind'] == 'css':
        return f'/* Generated terminal-ui compatibility adapter. */\n@import url("{src}");\n'.encode()
    if spec['kind'] == 'dom':
        return f"// Shared primitives; application action mappings remain local.\nexport * from '{src}';\nexport {{bindActions}} from './actions.js';\n".encode()
    if spec['kind'] == 'js':
        return f"// Generated terminal-ui compatibility adapter.\nexport * from '{src}';\n".encode()
    raise ValueError('Unknown compatibility adapter kind')

def check(repo):
    lock = json.loads((repo/'terminal-ui.lock.json').read_text())
    if lock.get('provider') != PROVIDER or lock.get('api_version') != API_VERSION:
        raise ValueError('Unsupported UI lock')
    web = web_root(repo)
    # No network in CI. Both payload and thin adapters must match the reviewed lock.
    for name, expected in lock['installed'].items():
        if not name.startswith('shared/') and name not in COMPAT:raise ValueError('Lock contains non-UI framework paths')
        path = web/relative(name)
        if path.is_symlink() or not path.is_file() or digest(path.read_bytes()) != expected:
            raise ValueError('Shared UI drift; update the package, not its generated copy: '+name)
    payload = {str(p.relative_to(web)) for p in (web/'shared').rglob('*') if p.is_file()}
    if payload != {n for n in lock['installed'] if n.startswith('shared/')}:
        raise ValueError('Unexpected or missing shared assets')
    if (repo/'packages/terminal-ui/manifest.json').is_file():
        _, expected = load_package(repo/'packages/terminal-ui')
        if expected != lock['manifest_sha256']:
            raise ValueError('Canonical package changed: regenerate and install it locally')
    elif digest(Path(__file__).read_bytes()) != lock['installer_sha256']:
        raise ValueError('Consumer installer differs from the pinned tool')
    return lock

def install(repo, source, revision):
    manifest, manifest_hash = load_package(source)
    web = web_root(repo);lock_path=repo/'terminal-ui.lock.json'
    old = json.loads(lock_path.read_text()) if lock_path.is_file() else None
    if old and (old.get('api_version') != API_VERSION or old.get('provider') != PROVIDER):
        raise ValueError('Unsupported installed UI contract')
    if (web/'shared').exists() and not old:
        raise ValueError('Refusing to overwrite an unowned shared directory')
    if old:
        # Refuse to discard consumer edits. Engine/screen code is never in this set.
        check(repo) if not (repo/'packages/terminal-ui').is_dir() else None
    bridges=json.loads((source/'bridges.json').read_text());writes={}
    for name in manifest['files']:
        if name.startswith('src/'):
            writes['shared/'+name[4:]]=(source/name).read_bytes()
    for target, spec in bridges.items():
        relative(target);relative(spec['source'])
        if target not in COMPAT or spec['source']!=target or 'src/'+spec['source'] not in manifest['files']:
            raise ValueError('Unsupported UI compatibility adapter')
        if target.startswith(('screens/','views/','analytics/')) or target in {'app.js','engine-client.js','window-workspace.js','index.html'}:
            raise ValueError('Shared package cannot replace framework code')
        writes[target]=(source/'src'/spec['source']).read_bytes() if spec['kind']=='copy' else wrapper(target,spec)
    # One-time split: preserve the consumer's application callbacks in a local file.
    dom=web/'ui/dom.js';actions=web/'ui/actions.js'
    if 'export function bindActions' in dom.read_text():
        content="import {listen} from '../shared/ui/dom.js';\nexport function bindActions"+dom.read_text().split('export function bindActions',1)[1]
        if actions.exists() and actions.read_text()!=content:
            raise ValueError('Existing local action mappings must be preserved manually')
        actions.write_text(content)
    elif not actions.is_file():
        raise ValueError('Missing application action mappings')
    for name, data in writes.items():
        path=web/relative(name)
        if path.is_symlink() or any(parent.is_symlink() for parent in path.parents if parent!=repo.parent):
            raise ValueError('Symlink in install destination')
        path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
    if old:
        for name in set(old['installed'])-set(writes):
            (web/relative(name)).unlink()
    lock={'provider':PROVIDER,'version':manifest['version'],'api_version':API_VERSION,'source_revision':revision,'manifest_sha256':manifest_hash,'installer_sha256':manifest['files']['install.py'],'installed':{n:digest(data) for n,data in sorted(writes.items())}}
    if not (repo/'packages/terminal-ui').is_dir():
        tool=repo/'scripts/sync_shared_ui.py';tool.parent.mkdir(parents=True,exist_ok=True)
        tool.write_bytes((source/'install.py').read_bytes())
    lock_path.write_text(json.dumps(lock,indent=2)+'\n')
    return lock

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2] if Path(__file__).parent.name=='terminal-ui' else Path(__file__).resolve().parent.parent)
    parser.add_argument('--source',type=Path,help='Local reviewed terminal-ui package directory')
    parser.add_argument('--revision',help='Pinned full public commit SHA; downloads only the public UI package')
    parser.add_argument('--check',action='store_true',help='Offline lock/payload/adapter integrity check')
    args=parser.parse_args();repo=args.repo.resolve()
    if args.check:
        if args.source or args.revision:parser.error('--check never downloads or updates')
        lock=check(repo)
    elif args.source:
        if args.revision:parser.error('Use either a local development source or a pinned public revision')
        lock=install(repo,args.source.resolve(),None)
    elif args.revision:
        with tempfile.TemporaryDirectory(prefix='terminal-ui-') as folder:
            lock=install(repo,remote_package(args.revision,Path(folder)),args.revision)
    else:
        parser.error('Use --check, --source PACKAGE_DIR, or --revision FULL_PUBLIC_SHA')
    print(json.dumps({'version':lock['version'],'api_version':lock['api_version'],'source_revision':lock['source_revision'],'assets':len(lock['installed'])}))
if __name__=='__main__':
    main()
