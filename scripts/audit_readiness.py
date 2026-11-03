"""Read-only audit probes against isolated fixtures/temporary SQLite."""
import json,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from monitor.analytics import backtest,study
from monitor.strategies import decorate,classify
from monitor import store
(ROOT/'work/audit').mkdir(parents=True,exist_ok=True)

def bar(date,op=100,close=100,volume=100):
 return {'date':date,'open':op,'high':max(op,close),'low':min(op,close),'close':close,'volume':volume,'value':10000}
def event(date='2026-01-05'):
 return decorate({'id':'e','ticker':'005930','company':'audit fixture','title':'자기주식취득결정','date':date,'available_at':date+'T23:59:59+09:00'})
def data(rows):return {'mode':'demo','events':[event()],'prices':{'005930':rows}}
results={}
results['classification']={t:classify(t) for t in ['자기주식취득결정','자기주식처분결정','유상증자결정 및 자기주식처분결정']}
gap=backtest(data([bar('2026-01-05'),bar('2026-01-20',close=120)]),holding=1,cost_bps=0)
assert gap['trades'][0]['entry_date']=='2026-01-20'
results['unverified_gap']={'event_date':'2026-01-05','entry_date':gap['trades'][0]['entry_date'],'claimed_return':gap['total_return'],'gap_warning_present':any('gap' in str(x).lower() for x in gap.get('warnings',[]))}
normal=data([bar('2026-01-05'),bar('2026-01-06',close=80),bar('2026-01-07',close=80)])
halted=data([bar('2026-01-05'),bar('2026-01-06',close=80),bar('2026-01-07',close=80,volume=0)])
a,b=backtest(normal,holding=2,cost_bps=0),backtest(halted,holding=2,cost_bps=0)
assert a['count']==1 and b['count']==0
results['future_halt_exclusion']={'normal_trade_count':a['count'],'normal_return':a['total_return'],'future_halt_trade_count':b['count'],'future_halt_return':b['total_return'],'reason':b['skipped'][0]['reason']}
s=study(event(),{'005930':[bar('2026-01-05'),bar('2026-01-06'),bar('2026-01-07'),bar('2026-01-08',close=120,volume=0)]},'069500')
assert s['horizons'][1]['return'] is not None
results['study_halted_exit']={'days':3,'exit_volume':0,'reported_return':s['horizons'][1]['return']}
original=store.DB
try:
 with tempfile.TemporaryDirectory(dir=ROOT/'work/audit') as tmp:
  store.DB=Path(tmp)/'audit.db'
  old={'mode':'live','as_of':'2026-11-03T07:00:00Z','events':[event()],'prices':{'005930':[bar('2026-01-05')]},'news':[],'sources':[{'name':'DART','state':'ok','collected_at':'2026-11-03T07:00:00Z'}]}
  store.save_live(old)
  failed={'mode':'live','as_of':'2026-11-04T07:00:00Z','events':[],'prices':{},'news':[],'sources':[{'name':n,'state':'blocked','detail':'audit timeout'} for n in ['DART','pykrx','뉴스 RSS']]}
  store.save_live(failed)
  stored=store.load('live')
  results['fresh_timestamp_on_failed_refresh']={'snapshot_as_of':stored['as_of'],'last_DART_success':stored['sources'][0]['last_success_at'],'old_event_retained':len(stored['events'])==1}
  revised=dict(old);revised['prices']={'005930':[bar('2026-01-05',close=200)]}
  store.save_live(revised)
  stored=store.load('live')
  results['overwrite_history']={'rows_for_same_ticker_date':len(stored['prices']['005930']),'latest_close':stored['prices']['005930'][0]['close'],'snapshot_table_rows':None}
  with store.connect() as conn:results['overwrite_history']['snapshot_table_rows']=conn.execute('SELECT count(*) FROM snapshots').fetchone()[0]
finally:store.DB=original
(ROOT/'work/audit/reproductions.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(results,ensure_ascii=False,indent=2))
