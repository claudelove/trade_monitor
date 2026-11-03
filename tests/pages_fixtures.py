"""Generate Python-engine golden outputs for the browser parity tests."""
import json
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from monitor.analytics import backtest,study
from monitor.demo import generate
from monitor.strategies import STRATEGIES,decorate
from scripts.build_pages import build
from tests.test_analytics import bar,event,data

build(ROOT/'dist')
live=json.loads((ROOT/'fixtures/bootstrap-live.json').read_text())
live['events']=[decorate(e) for e in live['events']]
edge=data([event(),event('two','2026-01-06'),event('three','2026-01-07',title='[기재정정]자기주식취득결정')],{'005930':[bar('2026-01-05',value=1),bar('2026-01-06',close=80),bar('2026-01-07',close=110),bar('2026-01-08',close=90)],'069500':[bar('2026-01-06',close=102),bar('2026-01-07',close=105)]})
delayed=data([event(ticker='AAAAAA'),event('two','2026-01-06','BBBBBB')],{'AAAAAA':[bar('2026-01-05'),bar('2026-01-06',volume=0),bar('2026-01-07',volume=0),bar('2026-01-08')],'BBBBBB':[bar('2026-01-06'),bar('2026-01-07')]})
snapshots=[generate(),live,edge,delayed,data([], {})]
cases=[]
studies=[]
for i,s in enumerate(snapshots):
 for strategy in STRATEGIES:
  for holding in [1,3,5,20]:
   for cost in [0,20,100]:
    for liquidity in [0,1e10]:
     params={'strategy':strategy,'holding':holding,'cost_bps':cost,'min_value':liquidity}
     expected=backtest(s,**params)
     expected.pop('assumptions')
     cases.append({'snapshot':i,'params':params,'expected':expected})
 for e in s['events']:
  studies.append({'snapshot':i,'event':e,'expected':study(e,s['prices'],'069500')})
Path('work').mkdir(exist_ok=True)
Path('work/pages-parity.json').write_text(json.dumps({'snapshots':snapshots,'cases':cases,'studies':studies}))
