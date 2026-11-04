"""Generate deterministic DOM test fixtures without running a web server."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from monitor.demo import generate
from monitor.analytics import backtest, study
from monitor.strategies import STRATEGIES
s = generate()
s['strategies'] = STRATEGIES
live = {'mode':'live','as_of':None,'events':[],'prices':{},'news':[],'sources':[],'strategies':STRATEGIES}
details = {e['id']:{'event':e,'study':study(e,s['prices'],'069500')} for e in s['events']}
Path('work').mkdir(exist_ok=True)
from monitor.integration import contract
runtime={'schema_version':'1.0','strategies':[],'runs':[],'transport':'private_backend','execution_control':'external_runtime','execution_adapter':'not_connected'}
Path('work/runtime-contract.json').write_text(json.dumps(contract()))
Path('work/runtime-state.json').write_text(json.dumps(runtime))
Path('work/ui-fixtures.json').write_text(json.dumps({'demo':s,'live':live,'backtest':backtest(s),'details':details}))
