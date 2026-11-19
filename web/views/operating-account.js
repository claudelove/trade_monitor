import {esc,listen} from '../ui/dom.js';
import {formatNumber,renderTable} from '../shared/ui/table.js';
const prefix='/api/v1/operations/accounts';
const money=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
const num=value=>formatNumber(money(value),{digits:0});
export const operatingAccountShell=()=>`<section data-operating-account><div class="section-bar">OPERATING PORTFOLIO / BROKER ACCOUNT</div><p class="section-note" role="status" aria-live="polite" data-operating-status>Loading protected operating accounts…</p><div data-operating-body></div></section>`;
export function mountOperatingAccount(root,ctx,pane){
 const host=root.querySelector('[data-operating-account]');if(!host)return ()=>{};
 const q=selector=>host.querySelector(selector),status=q('[data-operating-status]'),body=q('[data-operating-body]');
 let disposed=false,busy=false,generation=0;
 async function poll(){if(disposed||busy)return;busy=true;const token=generation;try{
  const accounts=await ctx.actions.api(prefix,{signal:ctx.signal});if(disposed||token!==generation)return;
  if(accounts.length!==1){status.textContent=accounts.length?'Multiple accounts configured: resolve the server account binding. No account chosen automatically.':'No connected broker account. Configure the server binding first.';body.innerHTML='';return}
  const id=accounts[0].account_id;pane.operatingAccount=id;
  status.textContent='Refreshing operating observations…';
  const names=['policy','demo','performance'];const replies=await Promise.allSettled(names.map(name=>ctx.actions.api(prefix+'/'+encodeURIComponent(id)+'/'+name,{signal:ctx.signal})));
  if(disposed||token!==generation||pane.operatingAccount!==id)return;
  const [policy,worker,performance]=replies.map(r=>r.status==='fulfilled'?r.value:null);
  // Publications must belong to the selected account and exact current policy.
  const valid=value=>value&&value.account_id===id;
  const p=valid(policy)?policy:null,w=valid(worker)?worker:null;
  const perf=valid(performance)&&p&&performance.policy_revision===p.revision?performance:null;
  const h=w?.heartbeat;
  status.textContent=`${accounts.find(a=>a.account_id===id).environment.toUpperCase()} / ${w?.worker_alive?'WORKER ALIVE':w?'WORKER NOT ALIVE':'WORKER UNAVAILABLE'} / ${h?.status||'NO HEARTBEAT'} / DESIRED ${w?.desired?.action||w?.desired?.desired||'—'}`;
  body.innerHTML=`<p class="account-clock">HEARTBEAT ${esc(h?.at||'—')} / AGE ${esc(w?.heartbeat_age_seconds==null?'—':Number(w.heartbeat_age_seconds).toFixed(1)+'s')} · POLICY ${esc(p?.revision||'UNAVAILABLE')}</p><div class="account-totals">${[['CAPITAL LIMIT / BUDGET',p?.body?.capital_limit_krw],['OBSERVED NAV',perf?.nav_krw],['ACCOUNT PNL',perf?.account_pnl_krw],['STRATEGY BOOK PNL',perf?.sleeve_pnl_krw]].map(([label,value])=>`<div><span>${label}</span><b>${num(value)}</b><small>KRW</small></div>`).join('')}</div><p class="section-note">Allocated capital is an operating budget, not a deposit or broker balance. ${perf?`VALUATION ${esc(perf.balance_as_of)} / MARKET ${esc(perf.market_as_of)} / RECONCILED ${esc(String(perf.reconciled))}. Account PnL requires opening NAV and external flows.`:'Valuation unavailable: account and market observations are not published together. No PnL or NAV chart is inferred from budgets, research results or an empty order book.'}</p><div class="section-bar">STRATEGY ALLOCATIONS / OWNED BOOKS</div>${renderTable({columns:[{key:'id',label:'STRATEGY'},{key:'budget',label:'BUDGET / KRW',type:'number'},{key:'equity',label:'BOOK EQUITY / KRW',type:'number'},{key:'pnl',label:'BOOK PNL / KRW',type:'number'},{key:'contribution',label:'CONTRIBUTION / PP',type:'number'}],rows:(p?.body?.strategies||[]).map(s=>{const book=perf?.strategies?.find(b=>b.strategy_id===s.id);return {id:s.id,budget:money(s.capital_krw),equity:money(book?.equity_krw),pnl:money(book?.pnl_krw),contribution:money(book?.contribution_percentage_points)}})})}${!p?'<p class="section-note">Policy unavailable; allocations are not inferred.</p>':''}${replies.some(r=>r.status==='rejected')?`<p class="section-note">Unavailable reads: ${names.filter((_,i)=>replies[i].status==='rejected').map(esc).join(', ')}. Available observations above remain independent; missing values are —.</p>`:''}`;
 }catch(error){if(!disposed&&token===generation){status.textContent='OPERATING SERVICE UNAVAILABLE · '+error.message;body.innerHTML=''}}
 finally{busy=false;if(!disposed&&token!==generation)void poll()}}

 void poll();const timer=setInterval(()=>void poll(),5000);
 return ()=>{disposed=true;generation++;clearInterval(timer)};
}
