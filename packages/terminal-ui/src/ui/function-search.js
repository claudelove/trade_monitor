import {esc,listen} from './dom.js';

// Plain entries/callbacks only. The host owns command parsing, registry and routing.
export function bindFunctionSearch(form,{entries,onSubmit,onError=()=>{}}){
 const input=form.querySelector('input'),toggle=form.querySelector('[data-screen-picker]'),popup=form.querySelector('.screen-picker'),results=popup.querySelector('[data-screen-results]'),status=popup.querySelector('[data-screen-count]'),doc=form.ownerDocument;
 let matches=[],active=-1,disposed=false,submitting=false,lastQuery=null;
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls',results.id);input.setAttribute('aria-expanded','false');
 const close=()=>{popup.hidden=true;toggle.setAttribute('aria-expanded','false');input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1};
 const highlight=()=>{results.querySelectorAll('[role=option]').forEach((row,i)=>{row.setAttribute('aria-selected',String(i===active));if(i===active){input.setAttribute('aria-activedescendant',row.id);row.scrollIntoView?.({block:'nearest'})}});if(active<0)input.removeAttribute('aria-activedescendant')};
 const search=()=>{
  lastQuery=input.value.trim();const query=lastQuery.toLocaleLowerCase(),terms=query.split(/\s+/),all=typeof entries==='function'?entries():entries;
  const score=row=>[row.number,row.command,...(row.aliases||[])].some(v=>String(v).toLocaleLowerCase()===query)?0:1;
  matches=all.filter(row=>terms.every(t=>[row.number,row.command,row.title,row.group,...(row.aliases||[])].join(' ').toLocaleLowerCase().includes(t))).sort((a,b)=>score(a)-score(b)||a.number.localeCompare(b.number));active=-1;
  results.innerHTML=matches.length?matches.map((row,i)=>`<button type="button" role="option" tabindex="-1" aria-selected="false" id="${esc(results.id)}-${i}" data-search-index="${i}"><strong>${esc(row.number)}</strong><span><b>${esc(row.command)}</b> ${esc(row.title)}</span><small>${esc(row.group)}</small></button>`).join(''):'<div class="empty">No matching functions. Enter a registered command or change the search.</div>';
  status.textContent=matches.length+' FUNCTIONS';input.removeAttribute('aria-activedescendant');
 };
 const open=(clear=false)=>{if(disposed)return;if(clear)input.value='';search();popup.hidden=false;toggle.setAttribute('aria-expanded','true');input.setAttribute('aria-expanded','true');input.focus()};
 const submit=(row,selected=false)=>{
  if(submitting||disposed)return;submitting=true;
  try{if(onSubmit(input.value.trim(),row,{selected})!==false){close();input.value=''}}catch(error){onError(error.message)}finally{submitting=false}
 };
 const off=[listen(toggle,'click',()=>popup.hidden?open(true):close()),listen(input,'input',()=>open()),listen(form,'submit',event=>{event.preventDefault();if(!input.value.trim()){open(true);return}if(input.value.trim()!==lastQuery)search();submit(matches[active<0?0:active]||null,active>=0)}),
 listen(form,'keydown',event=>{
  if(event.isComposing||event.key==='Enter'&&event.repeat){if(event.key==='Enter')event.preventDefault();return}
  if(event.key==='Escape'&&!popup.hidden){event.preventDefault();event.stopPropagation();close();input.focus()}
  else if(event.target===input&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();if(popup.hidden)open();if(matches.length){active=active<0?(event.key==='ArrowDown'?0:matches.length-1):(active+(event.key==='ArrowDown'?1:-1)+matches.length)%matches.length;highlight()}}
  else if(event.key==='Tab')close();
 }),listen(results,'click',event=>{const button=event.target.closest('[data-search-index]');if(button){const row=matches[Number(button.dataset.searchIndex)];if(row)submit(row,true)}}),
 listen(popup.querySelector('[data-screen-picker-close]'),'click',()=>{close();input.focus()}),listen(doc,'pointerdown',event=>{if(!form.contains(event.target))close()}),listen(doc,'focusin',event=>{if(!form.contains(event.target))close()})];
 return {open,close,dispose(){if(disposed)return;disposed=true;close();off.forEach(off=>off())}};
}
