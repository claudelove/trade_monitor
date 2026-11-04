"""Use the canonical public installer; consumers vendor this version-pinned tool."""
from pathlib import Path
import runpy
if __name__=='__main__':
    runpy.run_path(str(Path(__file__).resolve().parent.parent/'packages/terminal-ui/install.py'),run_name='__main__')
