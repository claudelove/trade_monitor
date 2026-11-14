import * as native from '../native-report.js';
import {esc,listen} from '../ui/dom.js';
export default {scope:'strategy',id:'runs',number:'0108',command:'ORD',aliases:['BLOTTER','FILLS'],legacyNumbers:['0501','0502'],legacyIds:['order-monitor','fill-tape'],desk:'backtest',title:'Backtest Order & Fill Journal',subtitle:'Stored strategy orders, fills and decisions / timestamps are execution-bar labels.',
 render(ctx,pane){const run=ctx.nativeRun;if(!run)return '<div class="empty">No stored strategy run.</div>';
 const query=(pane.query||'').toLowerCase(),status=pane.status||'all';
 const orders=run.orders.filter(o=>(status==='all'||o.status===status)&&[o.symbol,o.client_id,o.reason,o.decision_reason].join(' ').toLowerCase().includes(query));
 const ids=new Set(orders.map(o=>o.client_id));const fills=run.fills.filter(f=>ids.has(f.client_id));
 return `<p class="section-note">BACKTEST / SIMULATED ORDERS &amp; FILLS · No brokerage orders. KIS DEMO activity belongs to BROKER [0504].</p><div class="toolbar"><input data-order-query aria-label="Order search" placeholder="Symbol / client order ID / reason" value="${esc(pane.query||'')}"><select data-order-status aria-label="ORDER STATE"><option value="all">ALL</option>${[...new Set(run.orders.map(o=>o.status))].map(s=>`<option ${s===status?'selected':''}>${esc(s)}</option>`).join('')}</select><span>${orders.length} / ${run.orders.length} ORDERS</span></div>`+native.runView({...run,orders,fills})},
 mount(root,ctx,pane){return listen(root,'change',e=>{if(e.target.matches('[data-order-query]'))pane.query=e.target.value;if(e.target.matches('[data-order-status]'))pane.status=e.target.value;ctx.actions.render()})}
};
