
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const finite=v=>typeof v==='number'&&Number.isFinite(v);
export const num=v=>finite(v)?v.toLocaleString('en-GB',{maximumFractionDigits:2}):'N/A';
export const pct=v=>finite(v)?(v*100).toFixed(2)+'%':'N/A';
export const sign=v=>finite(v)?v<0?'negative':'positive':'muted';
export function panel(title,body,note=''){return `<section class="panel analysis-panel"><div class="panel-head"><div class="panel-title">${title}</div></div>${body}${note?`<div class="section-note">${note}</div>`:''}</section>`}
export function table(headers,body){return body.length?`<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${body.join('')}</tbody></table></div>`:'<div class="empty">No reported observations to analyze.</div>'}
export function cards(items){return `<div class="analysis-metrics">${items.map(([label,value,basis])=>`<div><span>${label}</span><strong>${value}</strong><small>${basis||''}</small></div>`).join('')}</div>`}
export function empty(title){return panel(title,'<div class="empty"><strong>SELECT A STRATEGY RESULT</strong>Choose an account/run and select the strategy in this panel.<br>Waiting for a stored engine publication.</div>','Engine observations / read only')}

export function scope(ctx){return `<div class="analysis-scope">${esc(ctx.entry?.name||'NO STRATEGY')} · ${esc(ctx.run?.summary.mode||ctx.legacy?.mode||ctx.entry?.state||'N/A')}<small>STRATEGY ID ${esc(ctx.run?.strategy_id||ctx.legacy?.strategy_id||ctx.entry?.row?.strategy_id||'N/A')} · RUN ${esc(ctx.entry?.id||'N/A')} · ${esc(ctx.run?.curve.at(-1)?.timestamp||ctx.legacy?.as_of||ctx.account?.as_of||'TIME UNREPORTED')}</small></div>`}

