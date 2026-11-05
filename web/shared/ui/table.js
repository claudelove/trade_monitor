import {esc} from './dom.js';
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const numericTypes=new Set(['number','price','quantity','percent']);
const precision=(value,fallback)=>{const digits=value??fallback;if(!Number.isInteger(digits)||digits<0||digits>12)throw Error('Table precision must be 0–12');return digits};
export function formatNumber(value,{digits=6,signed=false,missing='—'}={}){
 const maximumFractionDigits=precision(digits,6);
 if(!finite(value))return missing;
 const normalized=Object.is(value,-0)?0:value;
 return (signed&&normalized>0?'+':'')+normalized.toLocaleString('en-US',{maximumFractionDigits});
}
export function formatPercent(value,{basis,digits=2,signed=false,missing='—'}={}){
 if(!['ratio','points'].includes(basis))throw Error('Specify percentage basis: ratio or points');
 const places=precision(digits,2);if(!finite(value))return missing;
 const scaled=basis==='ratio'?value*100:value;if(!Number.isFinite(scaled))return missing;
 return (signed&&scaled>0?'+':'')+(Object.is(scaled,-0)?0:scaled).toLocaleString('en-US',{minimumFractionDigits:places,maximumFractionDigits:places})+'%';
}
export const valueTone=value=>!finite(value)?'muted':value<0?'negative':value>0?'positive':'';
// Compatibility wrapper: rowHTML must be generated/escaped by the host renderer.
// New consumers should prefer renderTable, which escapes every source cell.
export function tableMarkup(columns,rowHTML,{caption='',emptyText='No source records.',keepEmpty=false,bodyId=''}={}){
 if(!rowHTML.length&&!keepEmpty)return `<div class="empty table-empty">${esc(emptyText)}</div>`;
 const normalized=columns.map(column=>typeof column==='string'?{label:column}:column);
 return `<div class="table-wrap" tabindex="0"${caption?` role="region" aria-label="${esc(caption)}"`:''}><table class="terminal-table">${caption?`<caption class="table-caption">${esc(caption)}</caption>`:''}<thead><tr>${normalized.map(column=>`<th scope="col"${column.align==='right'||numericTypes.has(column.type)?' class="numeric"':''}>${esc(column.label)}${column.unit?` <small class="table-unit">/ ${esc(column.unit)}</small>`:''}</th>`).join('')}</tr></thead><tbody${bodyId?` id="${esc(bodyId)}"`:''}>${rowHTML.join('')}</tbody></table></div>`;
}
export function renderTable({columns,rows,caption='',emptyText='No source records.'}){
 const body=rows.map(row=>'<tr>'+columns.map(column=>{
  const value=row[column.key],numeric=numericTypes.has(column.type),missing=numeric?!finite(value):value==null;
  const formatted=column.type==='percent'?formatPercent(value,column):numeric?formatNumber(value,column):value==null?'—':String(value);
  const classes=[numeric?'numeric':'',column.keyColumn?'table-key':'',column.wrap?'wrap-cell':'',missing?'table-missing':'',column.signed?valueTone(value):''].filter(Boolean).join(' ');
  return `<td${classes?` class="${classes}"`:''}${missing?' aria-label="Unavailable"':numeric?` title="${esc(value)}"`:''}>${esc(formatted)}</td>`;
 }).join('')+'</tr>');
 return tableMarkup(columns,body,{caption,emptyText});
}
