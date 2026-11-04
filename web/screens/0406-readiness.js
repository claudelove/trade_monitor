import {esc} from '../ui/dom.js';
const labels={implemented:'STORAGE IMPLEMENTED',read_only:'REST QUERY',polling:'POLLING',paper_only:'PAPER LEDGER',missing:'MISSING',unverified:'UNVERIFIED'};
export default {id:'readiness',number:'0406',command:'READY',aliases:['OPS'],desk:'analysis',title:'Live Readiness Inventory',
 render(){return '<div data-readiness role="status">Loading implementation inventory…</div>'},
 mount(root,ctx){const box=root.querySelector('[data-readiness]');ctx.actions.api('/api/readiness',{signal:ctx.signal}).then(value=>{
   if(ctx.signal.aborted)return;
   box.innerHTML=`<div class="readiness-summary"><strong>LIVE BLOCKED / BROKER DISCONNECTED</strong><p>Credentials and capital alone are insufficient. This is an implementation inventory, not a connectivity test or trading certification.</p></div><div class="table-wrap"><table><thead><tr><th>AREA</th><th>STATE</th><th>IMPLEMENTED SCOPE / REMAINING WORK</th></tr></thead><tbody>${value.checks.map(c=>`<tr><td>${esc(c.area)}</td><td class="${c.state==='missing'?'negative':'muted'}">${esc(labels[c.state]||c.state)}</td><td class="wrap-cell">${esc(c.detail)}</td></tr>`).join('')}</tbody></table></div>`;
 }).catch(error=>{if(!ctx.signal.aborted)box.textContent='INVENTORY QUERY FAILED: '+error.message});return ()=>{}}
};
