import {bindWindowChrome,bindWindowGeometry} from './ui/window-actions.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {screens} from './screens.js';
export const tools=Object.fromEntries(screens.list.filter(s=>s.kind==='screen'&&s.panel!==false).map(s=>[s.id,s.number+' '+s.command+' / '+s.title]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const initial=(profile,registry)=>{const primary=registry.defaults(profile)[0];return primary?[{id:'pane-1',type:primary.id,x:0,y:0,w:1,h:1,minimized:false}]:[]};
export class WindowWorkspace {
 constructor({storage,content,bind,symbols,profile='strategy',registry=screens,onOpenScreen=null}){
  Object.assign(this,{storage,content,bind,symbols,profile,registry,onOpenScreen});this.cleanups=[];this.tools=Object.fromEntries(registry.panels(profile).map(s=>[s.id,s.number+' '+s.command+' / '+s.title]));this.storageKey='krx-terminal-layout-v2-'+profile;this.root=null;this.serial=0;this.focused=null;this.maximized=null;
  try{const saved=JSON.parse(storage.getItem(this.storageKey));if(!Array.isArray(saved)||saved.length>12)throw Error();this.panes=saved.map(p=>{if(!Object.hasOwn(this.tools,p.type)||typeof p.id!=='string'||!/^pane-\d+$/.test(p.id)||!['x','y','w','h'].every(k=>Number.isFinite(p[k])))throw Error();return {id:p.id,type:p.type,x:clamp(p.x,0,1),y:clamp(p.y,0,1),w:clamp(p.w,.01,1),h:clamp(p.h,.01,1),minimized:p.minimized===true}});this.panes.forEach(p=>{p.x=Math.min(p.x,1-p.w);p.y=Math.min(p.y,1-p.h)});if(new Set(this.panes.map(p=>p.id)).size!==this.panes.length)throw Error()}catch{this.panes=initial(this.profile,this.registry)}
  this.serial=Math.max(0,...this.panes.map(p=>Number(p.id.slice(5))));
 }
 save(){try{this.storage.setItem(this.storageKey,JSON.stringify(this.panes.map(({id,type,x,y,w,h,minimized})=>({id,type,x,y,w,h,minimized}))))}catch{}}
 open(type,parameters=null){const params=typeof parameters==='string'?{symbol:parameters}:parameters||{};if(!Object.hasOwn(this.tools,type))return;let pane=!this.registry.get(type).repeatable&&this.panes.find(p=>p.type===type);if(!pane){if(this.panes.length>=12){this.message('A workspace supports up to 12 panels.');return}const offset=this.panes.length%6*.035;pane={id:'pane-'+(++this.serial),type,x:.04+offset,y:.04+offset,w:.52,h:.56,minimized:false};this.panes.push(pane)}for(const [key,value]of Object.entries(params))if(!['id','type','x','y','w','h'].includes(key))pane[key]=value;pane.minimized=false;this.maximized=null;this.focused=pane.id;this.save();this.render();this.raise(pane.id)}
 reset(){this.panes=initial(this.profile,this.registry);this.serial=this.panes.length;this.maximized=null;this.save();this.render()}
 message(text){if(this.root)this.root.querySelector('[data-workspace-status]').textContent=text}
 raise(id){this.focused=id;this.panes.forEach(p=>{const el=this.root?.querySelector('[data-pane="'+p.id+'"]');if(el){el.style.zIndex=p.id===id?'20':String(this.panes.indexOf(p)+1);el.classList.toggle('focused',p.id===id)}})}
 geometry(pane,element){const maximized=this.maximized===pane.id;Object.assign(element.style,{left:(maximized?0:pane.x*100)+'%',top:(maximized?0:pane.y*100)+'%',width:(maximized?100:pane.w*100)+'%',height:pane.minimized?'30px':(maximized?100:pane.h*100)+'%'});element.classList.toggle('is-maximized',maximized);element.classList.toggle('is-minimized',pane.minimized)}
 disposePanels(){for(const off of this.cleanups.splice(0))off()}
 dispose(){this.disposePanels();this.root=null}
 mount(root){this.root=root;this.render()}
 render(){this.disposePanels();if(!this.root?.isConnected)return;const document=this.root.ownerDocument;this.root.innerHTML=`<div class="desktop-toolbar"><button data-screen-picker aria-expanded="false" aria-haspopup="dialog">SCREENS / Search</button><span class="hint">Drag title to move · drag edges to resize</span><span data-workspace-status role="status"></span></div><div class="screen-picker" role="dialog" aria-label="Screen list and search" hidden><div class="screen-picker-head"><label>SCREEN SEARCH <input data-screen-query type="search" placeholder="Number, command or name" autocomplete="off"></label><button data-screen-picker-close aria-label="Close screen search">×</button></div><div data-screen-results class="screen-results"></div><span data-screen-count role="status"></span></div><div class="workspace-canvas" aria-label="Independent panel workspace"></div>`;
  const toggle=this.root.querySelector('[data-screen-picker]'),picker=this.root.querySelector('.screen-picker'),query=picker.querySelector('input'),results=picker.querySelector('[data-screen-results]');
  const closePicker=()=>{picker.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()};
  const entries=this.onOpenScreen?this.registry.list.filter(s=>s.kind==='screen'):this.registry.panels(this.profile);
  const search=()=>{const terms=query.value.trim().toLocaleLowerCase().split(/\s+/);const matches=entries.filter(s=>terms.every(t=>[s.number,s.command,s.title,s.desk,...(s.aliases||[])].join(' ').toLocaleLowerCase().includes(t)));
   results.innerHTML=matches.length?matches.map(s=>`<button data-open-tool="${escape(s.id)}"><strong>${escape(s.number)}</strong><span>${escape(s.command)} / ${escape(s.title)}</span><small>${escape(s.desk)}</small></button>`).join(''):'<div class="empty">No matching screens.</div>';
   picker.querySelector('[data-screen-count]').textContent=matches.length+' screens';
  };
  toggle.onclick=()=>{if(!picker.hidden){closePicker();return}picker.hidden=false;toggle.setAttribute('aria-expanded','true');query.value='';search();query.focus()};
  picker.querySelector('[data-screen-picker-close]').onclick=closePicker;query.oninput=search;
  results.onclick=event=>{const button=event.target.closest('[data-open-tool]');if(button){closePicker();if(this.onOpenScreen)this.onOpenScreen(button.dataset.openTool);else this.open(button.dataset.openTool)}};
  picker.onkeydown=event=>{const buttons=[...results.querySelectorAll('button')];if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closePicker()}else if(['ArrowDown','ArrowUp'].includes(event.key)&&buttons.length){event.preventDefault();const index=buttons.indexOf(document.activeElement);buttons[(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus()}else if(event.key==='Enter'&&event.target===query){event.preventDefault();buttons[0]?.click()}else if(event.key==='Tab'){const items=[query,picker.querySelector('[data-screen-picker-close]'),...buttons];if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();query.focus()}}};
  const outside=event=>{if(!picker.hidden&&!picker.contains(event.target)&&!toggle.contains(event.target)){picker.hidden=true;toggle.setAttribute('aria-expanded','false')}};document.addEventListener('pointerdown',outside);this.cleanups.push(()=>document.removeEventListener('pointerdown',outside));
  const canvas=this.root.querySelector('.workspace-canvas');if(!this.panes.length)canvas.innerHTML='<div class="empty">Open a screen from SCREENS / Search or enter its number in the command line.</div>';
  for(const pane of this.panes){
   const element=document.createElement('section');element.className='tool-window';element.dataset.pane=pane.id;element.dataset.tool=pane.type;element.setAttribute('aria-label',this.tools[pane.type]);
   const screen=this.registry.get(pane.type);
   element.innerHTML=`<div class="window-titlebar" tabindex="0" role="group" aria-label="${escape(this.tools[pane.type])}" title="Drag to move; arrow keys move; double-click or Enter maximizes"><span class="window-number">${escape(screen.number)}</span><span class="window-title">${escape(screen.command)} / ${escape(screen.title)}</span><div class="window-buttons"><button data-window-action="maximize" aria-label="Maximize or restore panel">□</button><button data-window-action="close" aria-label="Close panel">×</button></div></div><div class="window-body">${this.content(pane).replace(/\bid="([^"]+)"/g,'data-field="$1"')}</div>${['n','s','e','w','ne','nw','se','sw'].map(edge=>`<span class="window-resize resize-${edge}" data-window-resize="${edge}" ${edge==='se'?'tabindex="0" role="group" aria-label="Resize panel with arrow keys"':''}></span>`).join('')}`;
   canvas.append(element);this.geometry(pane,element);
   const maximize=()=>{this.maximized=this.maximized===pane.id?null:pane.id;this.focused=pane.id;this.render();this.root?.querySelector('[data-pane="'+pane.id+'"] .window-titlebar')?.focus({preventScroll:true})};
   this.cleanups.push(bindWindowChrome(element,{onFocus:()=>this.raise(pane.id),onAction:action=>{if(action==='close'){this.panes=this.panes.filter(p=>p!==pane);if(this.maximized===pane.id)this.maximized=null;this.focused=this.panes.at(-1)?.id||null;this.save();this.render();this.root?.querySelector(this.focused?'[data-pane="'+this.focused+'"] .window-titlebar':'[data-screen-picker]')?.focus({preventScroll:true})}else maximize()},onToggleMaximize:maximize}));
   this.cleanups.push(bindWindowGeometry(element,{bounds:()=>canvas,getGeometry:()=>({x:pane.x,y:pane.y,w:pane.w,h:pane.h}),enabled:()=>this.maximized!==pane.id&&(document.defaultView.innerWidth>700),onChange:box=>{Object.assign(pane,box);this.geometry(pane,element)},onCommit:()=>this.save()}));

   const off=this.bind(element.querySelector('.window-body'),pane);if(typeof off==='function')this.cleanups.push(off);
  }
  if(this.focused)this.raise(this.focused);
 }
}

