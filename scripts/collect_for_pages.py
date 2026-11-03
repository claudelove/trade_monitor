"""Treat workflow inputs as data, never shell interpolation."""
import os
import subprocess
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from monitor.recovery import restore_if_empty,export_public

if __name__=='__main__':
    restore_if_empty(ROOT/'fixtures/bootstrap-live.json')
    args=[sys.executable,'-m','monitor.cli']
    for field in ('start','end','tickers','query'):
        value=os.environ.get('INPUT_'+field.upper(),'').strip()
        if value:args.extend(['--'+field,value])
    subprocess.run(args,cwd=ROOT,check=True)
    export_public(ROOT/'fixtures/bootstrap-live.json')
