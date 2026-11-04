// Self-authored synthetic contract data, not a private engine output or strategy.
export function nativeRun(id='synthetic-run',strategy='synthetic-strategy'){
 const timestamp='2026-11-04T06:00:00+00:00';
 return {id,account_id:'synthetic-account',strategy_id:strategy,
 summary:{strategy:'SYNTHETIC CONTRACT TEST',implementation:'dsl',mode:'historical_paper',initial_equity:1000,final_equity:1002,positions:{SYNTHETIC:1},net_pnl:2,daily_pnl:2,total_return:.002,max_drawdown:0,halted:false,error:null},
 strategy:{name:'SYNTHETIC'},plugin:null,limits:{max_gross:1},costs:{},data_sha256:'a'.repeat(64),
 curve:[{timestamp,equity:1002,positions:{SYNTHETIC:1},net_pnl:2,gross_exposure:.1,drawdown:0}],
 orders:[{timestamp,symbol:'SYNTHETIC',quantity:1,status:'filled'}],fills:[{timestamp,symbol:'SYNTHETIC',quantity:1,price:10,fee:0}],
 decisions:[],market:[{timestamp,symbol:'SYNTHETIC',open:10,high:12,low:9,close:11,volume:100,tradable:true}]};
}
export function nativeAccount(){const run=nativeRun();return {id:'synthetic-account',name:'SYNTHETIC ACCOUNT',mode:'historical_paper',status:'completed_with_errors',updated_at:'2026-11-04T06:00:01+00:00',as_of:run.curve[0].timestamp,summary:{nav:1002,net_pnl:2,daily_pnl:2,total_return:.002,max_reconciliation_residual:0},curve:run.curve,strategies:[{strategy_id:run.strategy_id,run_id:run.id,state:'ERROR',allocated_capital:1000,nav:1002,pnl:2,daily_pnl:2,contribution_pp:.2}],runs:{[run.id]:run}}}

