// Browser engine. Golden tests compare it with monitor/analytics.py.
const cmp=(a,b)=>a<b?-1:a>b?1:0;
const sorted=rows=>[...(rows||[])].sort((a,b)=>cmp(a.date,b.date));
export function eligibleDate(event){
 let value=event.available_at||event.date+'T23:59:59+09:00';
 if(!/(Z|[+-]\d\d:\d\d)$/.test(value))value+='+09:00';
 return new Date(value).toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
}
export function eventStudy(event,prices,benchmark='069500'){
 const rows=sorted(prices[event.ticker]),index=rows.findIndex(r=>r.date>eligibleDate(event)&&r.open>0&&r.volume>0);
 if(index<0)return {available:false,reason:'이벤트 이후 거래 가능한 일봉 없음'};
 const base=rows[index],bm=new Map((prices[benchmark]||[]).map(r=>[r.date,r]));
 const horizons=[1,3,5,10,20].map(days=>{
  const end=rows[index+days-1];if(!end)return {days,return:null,excess:null};
  const ret=end.close/base.open-1,a=bm.get(base.date),b=bm.get(end.date);
  return {days,return:ret,excess:a&&b&&a.open>0?ret-(b.close/a.open-1):null};
 });
 return {available:true,entry_date:base.date,entry_price:base.open,horizons};
}
export function runBacktest(snapshot,{strategy='buyback',holding=5,cost_bps=20,min_value=0,start=null,end=null}={}){
 if(!Number.isInteger(holding)||holding<1||holding>60||!Number.isFinite(cost_bps)||cost_bps<0||cost_bps>500||!Number.isFinite(min_value)||min_value<0||start&&end&&start>end)throw Error('백테스트 설정을 확인하세요.');
 const prices=snapshot.prices,candidates=snapshot.events.filter(e=>e.strategy===strategy&&!e.correction&&e.ticker&&(!start||e.date>=start)&&(!end||e.date<=end)).sort((a,b)=>cmp(eligibleDate(a),eligibleDate(b))||cmp(a.id,b.id));
 const trades=[],skipped=[],proposals=[];let busyUntil='';
 for(const event of candidates){
  const rows=sorted(prices[event.ticker]),i=rows.findIndex(r=>r.date>eligibleDate(event)&&r.open>0&&r.volume>0);let reason=null;
  if(i<0||i+holding>rows.length)reason='미완료 / 가격 없음';
  else if(i===0||rows[i-1].value<min_value)reason='진입 전 거래대금 미달 / 관측 없음';
  else if(rows.slice(i,i+holding).some(r=>r.volume<=0||r.close<=0))reason='거래정지 / 유효하지 않은 봉';
  if(reason){skipped.push({id:event.id,reason});continue}
  proposals.push({event,a:rows[i],b:rows[i+holding-1]});
 }
 proposals.sort((x,y)=>cmp(x.a.date,y.a.date)||cmp(x.event.id,y.event.id));
 for(const {event,a,b} of proposals){
  if(a.date<=busyUntil){skipped.push({id:event.id,reason:'기존 포지션과 중복'});continue}
  const gross=b.close/a.open-1,net=b.close*(1-cost_bps/10000)/(a.open*(1+cost_bps/10000))-1;
  trades.push({event_id:event.id,company:event.company,ticker:event.ticker,entry_date:a.date,exit_date:b.date,entry_price:a.open,exit_price:b.close,gross,net});busyUntil=b.date;
 }
 const dates=trades.length?[...new Set(trades.flatMap(t=>prices[t.ticker].filter(r=>r.date>=trades[0].entry_date&&r.date<=trades.at(-1).exit_date).map(r=>r.date)))].sort(cmp):[];
 const entries=new Map(trades.map(t=>[t.entry_date,t])),maps=Object.fromEntries(Object.entries(prices).map(([t,rows])=>[t,new Map(rows.map(r=>[r.date,r]))]));
 let equity=1,cash=1,active=null,shares=0,peak=1,mdd=0;const curve=[];
 for(const date of dates){
  if(entries.has(date)){active=entries.get(date);shares=cash/(active.entry_price*(1+cost_bps/10000))}
  if(active){const bar=maps[active.ticker].get(date);if(bar)equity=shares*bar.close;if(date===active.exit_date){cash=equity*(1-cost_bps/10000);equity=cash;active=null}}
  else equity=cash;
  curve.push({date,equity});peak=Math.max(peak,equity);mdd=Math.min(mdd,equity/peak-1);
 }
 return {mode:snapshot.mode,trades,skipped,curve,total_return:equity-1,max_drawdown:mdd,win_rate:trades.length?trades.filter(t=>t.net>0).length/trades.length:null,count:trades.length,assumptions:['공시일 다음 거래 가능일 시가 진입',holding+'개 종목 거래일 보유 후 종가 청산','현금 100% 단일 포지션 · 중복 신호 제외','매수·매도 각각 '+cost_bps+'bp 비용','롱온리 · 손절/공매도/레버리지 미구현','일봉 종가 평가 MDD · 장중 손실 미포함','선택 종목·공시 표본 기준 · 생존편향 통제 안 됨','수정주가 기준 · 배당 현금흐름 별도 반영 안 됨','거래대금 미제공 시 종가×거래량 추정치로 진입 전일 필터']};
}
