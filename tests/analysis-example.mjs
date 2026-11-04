// Deliberately synthetic report records for UI inspection, not a strategy/backtest.
export function analysisExample(){
 const symbols=['SIM_A','SIM_B','SIM_F1','SIM_F2'],capital=[40000000,30000000,20000000],names=['합성 Alpha','합성 Relative Value','합성 Defensive'],accountId='synthetic-analysis-account',runs={},rows=[];
 const timestamps=Array.from({length:45},(_,i)=>new Date(Date.UTC(2026,8,1+i,6)).toISOString());
 for(let j=0;j<3;j++){
  const id='synthetic-analysis-run-'+j,strategy_id='synthetic-sleeve-'+j,positions=Object.fromEntries(symbols.map((s,k)=>[s,[[120000,45000,-300,150],[40000,-20000,500,-350],[60000,25000,-200,100]][j][k]]));
  const curve=timestamps.map((timestamp,i)=>{const equity=capital[j]*(1+.0008*i+(.006+j*.002)*Math.sin(i/(3+j)+j)-(.006+j*.002)*Math.sin(j));return {timestamp,equity,net_pnl:equity-capital[j],daily_pnl:i?equity-capital[j]*(1+.0008*(i-1)+(.006+j*.002)*Math.sin((i-1)/(3+j)+j)-(.006+j*.002)*Math.sin(j)):0,gross_exposure:.45+j*.13,positions:{...positions},drawdown:0}});
  const market=timestamps.flatMap((timestamp,i)=>symbols.map((symbol,k)=>{const close=80+k*35+i*.18+4*Math.sin(i/4+k);return {timestamp,symbol,open:close-.4,high:close+1,low:close-1,close,volume:100000+i*100,tradable:true}}));
  let peak=capital[j];for(const point of curve){peak=Math.max(peak,point.equity);point.drawdown=point.equity/peak-1;const values=symbols.map((symbol,k)=>positions[symbol]*market.find(b=>b.symbol===symbol&&b.timestamp===point.timestamp).close*(k>1?10:1));point.gross_exposure=values.reduce((sum,value)=>sum+Math.abs(value),0)/point.equity;point.net_exposure=values.reduce((sum,value)=>sum+value,0)/point.equity;}
  const orders=[0,1,2,3].map((k)=>({client_id:id+'-order-'+k,timestamp:timestamps.at(-1),symbol:symbols[k],quantity:[100,80,-60,40][k],status:['filled','partial','rejected','unfilled'][k],reason:'합성 형식 예시'}));
  const fills=orders.slice(0,2).map((o,k)=>({client_id:o.client_id,timestamp:o.timestamp,symbol:o.symbol,quantity:k?40:100,price:100+k*30,fee:10,slippage:5}));
  const last=curve.at(-1),summary={strategy:names[j],mode:'historical_paper',implementation:'synthetic_report_only',initial_equity:capital[j],final_equity:last.equity,net_pnl:last.net_pnl,daily_pnl:last.daily_pnl,total_return:last.net_pnl/capital[j],max_drawdown:Math.min(...curve.map(p=>p.drawdown)),halted:false,error:null};
  runs[id]={id,account_id:accountId,strategy_id,summary,curve,market,orders,fills,decisions:[],plugin:null,limits:{max_gross:1.5},strategy:{name:names[j],instruments:symbols.map((symbol,k)=>({symbol,kind:k>0?'future':'equity',multiplier:k>1?10:1}))},source:{synthetic:true}};
  rows.push({run_id:id,strategy_id,name:names[j],state:'COMPLETED',allocated_capital:capital[j],nav:last.equity,pnl:last.net_pnl,daily_pnl:last.daily_pnl,contribution_pp:last.net_pnl/100000000*100});
 }
 const curve=timestamps.map((timestamp,i)=>({timestamp,equity:10000000+Object.values(runs).reduce((sum,run)=>sum+run.curve[i].equity,0),net_pnl:Object.values(runs).reduce((sum,run)=>sum+run.curve[i].net_pnl,0),gross_exposure:.58}));
 return {id:accountId,name:'합성 Portfolio / UI 예시',mode:'historical_paper',status:'completed',as_of:timestamps.at(-1),updated_at:timestamps.at(-1),initial_equity:100000000,unallocated_capital:10000000,summary:{nav:curve.at(-1).equity,net_pnl:curve.at(-1).net_pnl,daily_pnl:rows.reduce((sum,r)=>sum+r.daily_pnl,0),max_reconciliation_residual:0},curve,strategies:rows,runs,source:{synthetic:true},assumptions:['합성 모니터링 예시이며 실제 STRATEGY/체결/Strategy 성과가 아닙니다.']};
}

