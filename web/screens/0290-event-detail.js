import {esc,listen} from '../ui/dom.js';
const safeUrl=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?esc(u.href):'#'}catch{return '#'}};
export default {id:'event-detail',number:'0290',command:'EVENT',desk:'market',kind:'dialog',title:'Source Event Detail',
 parseArgs(args){if(!/^[a-f0-9]{64}$/.test(args[0]||''))throw Error('EVENT requires a canonical event ID.');return {eventId:args[0]}},
 async load(ctx,params){const detail=await ctx.actions.api('/api/data/events/'+encodeURIComponent(params.eventId));return {detail}},
 render(ctx){const d=ctx.detail,e=d.event,p=e.payload,r=p.record||{},url=p.url||(r.rcept_no&&/^\d+$/.test(r.rcept_no)?'https://dart.fss.or.kr/dsaf001/main.do?rcpNo='+r.rcept_no:null);
 return `<div class="modal-head"><h2>${esc(e.kind)} · ${esc(e.symbol||e.source)}</h2><button class="icon-button" data-close-event aria-label="Close">×</button></div><p>${esc(p.title||r.report_nm||e.source_event_id)}</p><dl class="event-clocks"><dt>SOURCE OCCURRENCE</dt><dd>${esc(e.occurred_at||'N/A')}</dd><dt>RECEIVED</dt><dd>${esc(e.received_at)}</dd><dt>AVAILABLE</dt><dd>${esc(e.available_at)}</dd><dt>QUALITY / REVISION</dt><dd>${esc(e.time_quality)} / ${esc(e.revision)}</dd></dl>${url?`<a class="button secondary" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">SOURCE DOCUMENT ↗</a>`:''}<p class="section-note">Untrusted external source data, not a current quote or trading signal. Inspect generated/available timestamps and lineage for derived features.</p><pre class="raw-evidence">${esc(JSON.stringify(d,null,2))}</pre>`},
 mount(root,ctx){return listen(root.querySelector('[data-close-event]'),'click',ctx.actions.closeEvent)}
};
