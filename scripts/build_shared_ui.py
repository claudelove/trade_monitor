"""Generate a deterministic release manifest for the public visual/interaction library."""
import argparse
import hashlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
PACKAGE=ROOT/'packages/terminal-ui'

def build(check=False):
    metadata=json.loads((PACKAGE/'package.json').read_text())
    version_text='// Generated from package metadata.\nexport const apiVersion=1;\nexport const version='+json.dumps(metadata['version'])+';\n'
    version_path=PACKAGE/'src/version.js'
    if check:
        if not version_path.is_file() or version_path.read_text()!=version_text:raise ValueError('Shared UI version stale: python scripts/build_shared_ui.py')
    else:version_path.write_text(version_text)
    for legal in (PACKAGE/'licenses').rglob('*'):
        if legal.is_file() and legal.name in {'LICENSE','LICENSE.md','NOTICE'}:
            relative=legal.relative_to(PACKAGE/'licenses');dest=PACKAGE/'src/licenses'/relative.parent/(relative.stem+'.txt' if relative.suffix else relative.name+'.txt')
            if check:
                if not dest.is_file() or dest.read_bytes()!=legal.read_bytes():raise ValueError('Shared dependency license stale')
            else:
                dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(legal.read_bytes())
    paths=[PACKAGE/'package.json',PACKAGE/'bridges.json',PACKAGE/'install.py',*(PACKAGE/'src').rglob('*'),*(PACKAGE/'licenses').rglob('*')]
    files={}
    for p in sorted(paths):
        if p.is_symlink():raise ValueError('UI library assets must not be symlinks')
        if p.is_file():files[p.relative_to(PACKAGE).as_posix()]=hashlib.sha256(p.read_bytes()).hexdigest()
    value={'name':metadata['name'],'version':metadata['version'],'api_version':1,'files':files}
    text=json.dumps(value,indent=2)+'\n';dest=PACKAGE/'manifest.json'
    if check:
        if not dest.is_file() or dest.read_text()!=text:raise ValueError('Shared UI manifest stale: python scripts/build_shared_ui.py')
    else:dest.write_text(text)
    return value
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();value=build(args.check);print(value['name'],value['version'],len(value['files']),'release files')
