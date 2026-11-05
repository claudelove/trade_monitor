import {esc} from '../ui/dom.js';
import {tableMarkup} from '../shared/ui/table.js';
export const eventTime=value=>typeof value==='string'&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&Number.isFinite(Date.parse(value))?Date.parse(value):null;
export function assessEvent(event,prices,{now=Date.now(),eventMinutes=60,barMinutes=30}={}){
 const occurred=eventTime(event.occurred_at),received=eventTime(event.received_at),available=eventTime(event.available_at);
 const symbol=event.ticker||event.symbol||'',bars=prices?.[symbol]||[];
 const bar=bars.at(-1),barTime=eventTime(bar?.timestamp||bar?.date),issues=[];
 if(!event.source)issues.push('NO SOURCE');
 if(!symbol)issues.push('NO SYMBOL');
 if(event.revision==null||event.revision==='')issues.push('NO REVISION');
 if(received===null||available===null)issues.push('MISSING CLOCKS');
 if(received!==null&&available!==null&&available<received)issues.push('CLOCK ORDER');
 if(occurred!==null&&received!==null&&received<occurred)issues.push('CLOCK ORDER');
 if([occurred,received,available,barTime].some(t=>t!==null&&t>now))issues.push('FUTURE CLOCK');
 if(available!==null&&now-available>eventMinutes*60000)issues.push('STALE EVENT');
 if(!bar)issues.push('NO PRICE');else if(barTime===null)issues.push('PRICE TIME UNKNOWN');
 else{if(now-barTime>barMinutes*60000)issues.push('STALE PRICE');if(available!==null&&barTime<available)issues.push('NO POST-EVENT BAR')}
 return {symbol,issues:[...new Set(issues)],barTime,latency:occurred!==null&&received!==null&&received>=occurred?(received-occurred)/1000:null};
}
export function eventMonitor(data,filters={}){
 const options={now:filters.now??Date.now(),eventMinutes:filters.eventMinutes??60,barMinutes:filters.barMinutes??30};
 const all=[...(data.news||[]).map(e=>({...e,monitorKind:'NEWS'})),...(data.events||[]).map(e=>({...e,monitorKind:'DISCLOSURE'}))];
 const records=all.map(event=>({event,check:assessEvent(event,data.prices,options)}));
 const query=(filters.query||'').toLowerCase();
 const visible=records.filter(({event:e,check:c})=>(!filters.kind||e.monitorKind===filters.kind)&&(!filters.gaps||c.issues.length)&&(!query||[e.title,e.source,c.symbol].join(' ').toLowerCase().includes(query))).sort((a,b)=>(eventTime(b.event.available_at)??-Infinity)-(eventTime(a.event.available_at)??-Infinity));
 const rows=visible.map(({event:e,check:c})=>`<tr ${e.id?'data-event="'+esc(e.id)+'"':''}><td>${esc(e.monitorKind)}<small>${esc(e.source||'UNREPORTED')}</small></td><td class="table-key">${c.symbol?`<button data-symbol="${esc(c.symbol)}">${esc(c.symbol)}</button>`:'—'}</td><td class="wrap-cell">${esc(e.title)}<small>${e.correction?'CORRECTION / ':''}REV ${esc(e.revision??'UNKNOWN')}</small></td><td class="wrap-cell">${esc(e.occurred_at||e.published_at||'UNKNOWN')}<small>RECEIVED ${esc(e.received_at||'UNKNOWN')}</small></td><td class="wrap-cell">${esc(e.available_at||'UNKNOWN')}<small>DELAY ${c.latency===null?'—':esc(c.latency)+' s'}</small></td><td class="wrap-cell">${esc(c.issues.join(' / ')||'METADATA CHECKS PASS')}<small>${c.barTime===null?'NO TIMED PRICE':new Date(c.barTime).toISOString()}</small></td></tr>`);
 const pass=records.filter(x=>!x.check.issues.length).length;
 return `<p class="section-note">BOUNDED STORED SAMPLE / ${all.length} records · ${pass} metadata checks pass · ${all.length-pass} with gaps. Evaluated ${esc(new Date(options.now).toISOString())}. These are data checks, not trading approval.</p>`+tableMarkup([{label:'SOURCE',width:120},{label:'SYMBOL',width:96},{label:'EVENT / REVISION',width:350},{label:'OCCURRED / RECEIVED',width:240},{label:'AVAILABLE / DELAY',width:240},{label:'DATA CHECK / LAST BAR',width:280}],rows,{className:'event-input-table',caption:'Strategy event-input monitoring',emptyText:'No source events match.'})+`<p class="section-note">Age thresholds are review settings: event ${options.eventMinutes} min / price ${options.barMinutes} min. Date-only prices cannot establish intraday linkage. Latest-bar checks are not event returns. Entity resolution, semantic extraction, revision-family deduplication and strategy consumption acknowledgements are not connected.</p>`;
}
export function marketCoverage(data){
 const series=Object.values(data.prices||{});let up=0,down=0,flat=0,usable=0;
 for(const bars of series){const a=bars.at(-2)?.close,b=bars.at(-1)?.close;if(Number.isFinite(a)&&a>0&&Number.isFinite(b)&&b>0){usable++;if(b>a)up++;else if(b<a)down++;else flat++}}
 return `<div class="section-note">STORED COVERAGE / ${series.length} price series · ${usable} comparable · UP ${up} / DOWN ${down} / FLAT ${flat} · NEWS ${(data.news||[]).length} / FILINGS ${(data.events||[]).length} · SOURCE ALERTS ${(data.sources||[]).filter(s=>['blocked','error','failed'].includes(s.state)).length}<br>Sample counts only; no market-wide breadth, live heartbeat or verified event-return calculation. EVENTMON [0203] checks clocks, revisions, symbol and price linkage.</div>`;
}
