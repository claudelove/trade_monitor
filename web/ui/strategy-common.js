
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const finite=v=>typeof v==='number'&&Number.isFinite(v);
export const num=v=>finite(v)?v.toLocaleString('ko-KR',{maximumFractionDigits:2}):'미보고';
export const pct=v=>finite(v)?(v*100).toFixed(2)+'%':'미보고';
export const sign=v=>finite(v)?v<0?'negative':'positive':'muted';
export function panel(title,body,note=''){return `<section class="panel analysis-panel"><div class="panel-head"><div class="panel-title">${title}</div></div>${body}${note?`<div class="section-note">${note}</div>`:''}</section>`}
export function table(headers,body){return body.length?`<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${body.join('')}</tbody></table></div>`:'<div class="empty">분석할 보고 항목이 없습니다.</div>'}
export function cards(items){return `<div class="analysis-metrics">${items.map(([label,value,basis])=>`<div><span>${label}</span><strong>${value}</strong><small>${basis||''}</small></div>`).join('')}</div>`}
export function empty(title){return panel(title,'<div class="empty"><strong>전략 결과를 연결하세요</strong>포트폴리오·전략을 선택하면 이 패널이 함께 갱신됩니다.<br>상단의 결과 파일 열기로 연결합니다.</div>','엔진 원본 계좌/실행 JSON 또는 이전 관측 파일 · 조회 전용')}

export function scope(ctx){return `<div class="analysis-scope">${esc(ctx.entry?.name||'전략 미선택')} · ${esc(ctx.run?.summary.mode||ctx.legacy?.mode||ctx.entry?.state||'미보고')}<small>전략 ID ${esc(ctx.run?.strategy_id||ctx.legacy?.strategy_id||ctx.entry?.row?.strategy_id||'미보고')} · 실행 ${esc(ctx.entry?.id||'미보고')} · ${esc(ctx.run?.curve.at(-1)?.timestamp||ctx.legacy?.as_of||ctx.account?.as_of||'시각 미보고')}</small></div>`}
