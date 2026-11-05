import {bindWindowChrome,bindWindowGeometry} from './ui/window-actions.js';
import {screens} from './screens.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const initial=(profile,registry)=>{const primary=registry.defaults(profile)[0];return primary?[{id:'pane-1',type:primary.id,x:0,y:0,w:1,h:1}]:[]};
const geometry=({x,y,w,h})=>({x,y,w,h});

export class WindowWorkspace {
 constructor({storage,content,bind,profile='strategy',registry=screens}){
  Object.assign(this,{storage,content,bind,profile,registry});
  this.tools=Object.fromEntries(registry.panels(profile).map(s=>[s.id,s.number+' '+s.command+' / '+s.title]));
  this.storageKey='krx-terminal-layout-v2-'+profile;
  this.root=null;this.focused=null;this.maximized=null;this.views=new Map();this.seen=new Set();this.snapEnabled=true;
  try{
   const saved=JSON.parse(storage.getItem(this.storageKey));
   if(!Array.isArray(saved)||saved.length>12)throw Error('Invalid layout');
   const ids=new Set(),types=new Set();this.panes=[];
   for(const stored of saved){
    const p={...stored};if(profile==='backtest'&&['strategies','python-registry','backtest-execution'].includes(p.type))p.type='strategy-lab';
    if(!Object.hasOwn(this.tools,p.type)||typeof p.id!=='string'||!/^pane-\d+$/.test(p.id)||ids.has(p.id)||!['x','y','w','h'].every(k=>Number.isFinite(p[k])))throw Error('Invalid pane');
    ids.add(p.id);
    // Earlier releases persisted repeated copies of GP/PERF. Keep one function per desk.
    if(types.has(p.type))continue;
    types.add(p.type);
    const pane={id:p.id,type:p.type,x:clamp(p.x,0,1),y:clamp(p.y,0,1),w:clamp(p.w,.01,1),h:clamp(p.h,.01,1)};
    pane.x=Math.min(pane.x,1-pane.w);pane.y=Math.min(pane.y,1-pane.h);this.panes.push(pane);
   }
  }catch{this.panes=initial(profile,registry)}
  this.serial=Math.max(0,...this.panes.map(p=>Number(p.id.slice(5))));
  this.order=this.panes.map(p=>p.id);
  this.loadSnapPreference();
 }
 loadSnapPreference(){try{this.snapEnabled=this.storage.getItem('krx-terminal-snap-v1')!=='false'}catch{}}
 showGuides(guides){
  const layer=this.root?.querySelector('.snap-guides');if(!layer)return;layer.replaceChildren();
  for(const guide of guides){const line=layer.ownerDocument.createElement('span');line.className='snap-guide snap-guide-'+guide.axis;line.style[guide.axis==='x'?'left':'top']=guide.at>=1-1e-9?'calc(100% - 1px)':(guide.at*100)+'%';layer.append(line)}
 }
 save(){try{this.storage.setItem(this.storageKey,JSON.stringify(this.panes.map(p=>({id:p.id,type:p.type,...geometry(p)}))))}catch{}}
 open(type,parameters=null){
  if(!Object.hasOwn(this.tools,type))return;
  const params=typeof parameters==='string'?{symbol:parameters}:parameters||{};
  let pane=this.panes.find(p=>p.type===type),changed=false;
  if(!pane){
   if(this.panes.length>=12){this.message('A workspace supports up to 12 panels.');return}
   const offset=this.panes.length%6*.035;
   pane={id:'pane-'+(++this.serial),type,x:.04+offset,y:.04+offset,w:.58,h:.66};this.panes.push(pane);
  }
  for(const [key,value]of Object.entries(params)){
   if(['id','type','x','y','w','h','minimized'].includes(key))continue;
   if(pane[key]!==value){pane[key]=value;changed=true}
  }
  if(changed)this.removeView(pane.id);
  if(this.maximized!==pane.id)this.maximized=null;
  this.focused=pane.id;this.save();this.render();this.raise(pane.id);
  this.views.get(pane.id)?.element.querySelector('.window-titlebar').focus({preventScroll:true});
 }
 message(text){const status=this.root?.querySelector('[data-workspace-status]');if(status)status.textContent=text}
 raise(id){
  this.focused=id;this.order=this.order.filter(key=>key!==id&&this.panes.some(p=>p.id===key));this.order.push(id);
  for(const [key,{element}]of this.views){element.style.zIndex=String(this.order.indexOf(key)+1);element.classList.toggle('focused',key===id)}
  this.root?.querySelectorAll('[data-window-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.windowTab===id)));
 }
 selectPane(id,focusWindow=true){
  const pane=this.panes.find(p=>p.id===id);if(!pane)return;
  if(this.maximized&&this.maximized!==id){this.maximized=null;this.render()}
  this.raise(id);
  const element=this.views.get(id)?.element;
  if(focusWindow)element?.querySelector('.window-titlebar').focus({preventScroll:true});
  if(this.root?.ownerDocument.defaultView.innerWidth<=700)element?.scrollIntoView?.({block:'nearest',behavior:'auto'});
 }
 renderTabs(){
  if(!this.root)return;
  let bar=this.root.querySelector('[data-window-tabs]');
  if(!bar){
   bar=this.root.ownerDocument.createElement('div');bar.className='window-tabs';bar.dataset.windowTabs='';bar.setAttribute('role','toolbar');
   const label=this.registry.home(this.profile)?.navLabel||this.profile;bar.setAttribute('aria-label',label+' open screens');
   bar.innerHTML=`<span class="window-tabs-label">${escape(label)}</span><div class="window-tabs-list"></div><span class="window-tabs-empty">No open screens</span><button type="button" class="snap-toggle" data-snap-toggle title="Align moving/resizing windows to edges · hold Alt to bypass">SNAP</button>`;
   bar.onclick=event=>{if(event.target.closest('[data-snap-toggle]')){this.snapEnabled=!this.snapEnabled;try{this.storage.setItem('krx-terminal-snap-v1',String(this.snapEnabled))}catch{}this.showGuides([]);this.renderTabs();return}const button=event.target.closest('[data-window-tab]');if(button)this.selectPane(button.dataset.windowTab)};
   bar.onkeydown=event=>{
    const buttons=[...bar.querySelectorAll('[data-window-tab]')],index=buttons.indexOf(event.target);
    if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    buttons[next].focus();this.selectPane(buttons[next].dataset.windowTab,false);
   };
   this.root.append(bar);
  }
  const list=bar.querySelector('.window-tabs-list');
  list.querySelectorAll('[data-window-tab]').forEach(button=>{if(!this.panes.some(p=>p.id===button.dataset.windowTab))button.remove()});
  for(const pane of this.panes){
   if(list.querySelector('[data-window-tab="'+pane.id+'"]'))continue;
   const screen=this.registry.get(pane.type),button=this.root.ownerDocument.createElement('button');button.type='button';button.dataset.windowTab=pane.id;button.textContent=screen.number+' '+screen.command;button.title=screen.title;button.setAttribute('aria-label',screen.number+' '+screen.title);list.append(button);
  }
  bar.querySelector('.window-tabs-empty').hidden=this.panes.length>0;
  const snap=bar.querySelector('[data-snap-toggle]');snap.textContent='SNAP '+(this.snapEnabled?'ON':'OFF');snap.setAttribute('aria-pressed',String(this.snapEnabled));
 }
 geometry(pane,element){
  const maximized=this.maximized===pane.id;
  Object.assign(element.style,{left:(maximized?0:pane.x*100)+'%',top:(maximized?0:pane.y*100)+'%',width:(maximized?100:pane.w*100)+'%',height:(maximized?100:pane.h*100)+'%'});
  element.classList.toggle('is-maximized',maximized);
  const button=element.querySelector('[data-window-action=maximize]');button.textContent=maximized?'❐':'□';button.setAttribute('aria-label',maximized?'Restore panel':'Maximize panel');button.setAttribute('aria-pressed',String(maximized));
 }
 removeView(id){const view=this.views.get(id);if(view){view.dispose();view.element.remove();this.views.delete(id)}}
 dispose(){for(const id of [...this.views.keys()])this.removeView(id);this.root=null}
 mount(root){this.dispose();this.loadSnapPreference();this.root=root;this.render()}
 toggleMaximize(pane){this.maximized=this.maximized===pane.id?null:pane.id;this.render();this.raise(pane.id);this.views.get(pane.id)?.element.querySelector('.window-titlebar').focus({preventScroll:true})}
 close(pane){
  this.removeView(pane.id);this.seen.delete(pane.id);this.panes=this.panes.filter(p=>p!==pane);this.order=this.order.filter(id=>id!==pane.id);
  if(this.maximized===pane.id)this.maximized=null;
  this.focused=this.order.at(-1)||null;this.save();this.render();
  this.views.get(this.focused)?.element.querySelector('.window-titlebar').focus({preventScroll:true});
  if(!this.panes.length)this.root?.querySelector('.workspace-canvas').focus({preventScroll:true});
 }
 render(){
  if(!this.root?.isConnected)return;
  const document=this.root.ownerDocument;
  let canvas=this.root.querySelector('.workspace-canvas');
  if(!canvas){this.root.innerHTML='<div class="workspace-canvas" tabindex="-1" aria-label="Independent panel workspace"><div data-workspace-status class="workspace-status" role="status"></div><div class="snap-guides" aria-hidden="true"></div></div>';canvas=this.root.querySelector('.workspace-canvas')}
  canvas.querySelector('.workspace-empty')?.remove();
  if(!this.panes.length)canvas.insertAdjacentHTML('beforeend','<div class="empty workspace-empty">Use SCREENS or enter a function number in the command line.</div>');
  for(const pane of this.panes){
   let view=this.views.get(pane.id);
   if(!view){
    const screen=this.registry.get(pane.type),element=document.createElement('section');element.className='tool-window';if(!this.seen.has(pane.id)){element.classList.add('window-enter');this.seen.add(pane.id)}element.dataset.pane=pane.id;element.dataset.tool=pane.type;element.setAttribute('aria-label',this.tools[pane.type]);
    element.innerHTML=`<div class="window-titlebar" tabindex="0" role="group" aria-label="${escape(this.tools[pane.type])}" title="Drag to move · arrows move · double-click or Enter maximizes"><span class="window-number">${escape(screen.number)}</span><span class="window-title">${escape(screen.command)} / ${escape(screen.title)}</span><div class="window-buttons"><button data-window-action="maximize" aria-label="Maximize panel">□</button><button data-window-action="close" aria-label="Close panel">×</button></div></div><div class="window-body">${this.content(pane).replace(/\bid="([^"]+)"/g,'data-field="$1"')}</div>${['n','s','e','w','ne','nw','se','sw'].map(edge=>`<span class="window-resize resize-${edge}" data-window-resize="${edge}" ${edge==='se'?'tabindex="0" role="group" aria-label="Resize panel with arrow keys"':''}></span>`).join('')}`;
    canvas.append(element);
    const cleanups=[bindWindowChrome(element,{onFocus:()=>this.raise(pane.id),onAction:action=>action==='close'?this.close(pane):this.toggleMaximize(pane),onToggleMaximize:()=>this.toggleMaximize(pane)}),bindWindowGeometry(element,{bounds:()=>canvas,getGeometry:()=>geometry(pane),enabled:()=>this.maximized!==pane.id&&document.defaultView.innerWidth>700,onChange:box=>{Object.assign(pane,box);this.geometry(pane,element)},onCommit:()=>this.save(),snapping:()=>this.snapEnabled,peers:()=>this.panes.filter(p=>p!==pane).map(geometry),onGuides:guides=>this.showGuides(guides)})];
    const off=this.bind(element.querySelector('.window-body'),pane);if(typeof off==='function')cleanups.push(off);
    view={element,dispose:()=>cleanups.splice(0).forEach(off=>off())};this.views.set(pane.id,view);
   }
   this.geometry(pane,view.element);
  }
  this.renderTabs();
  if(!this.panes.some(p=>p.id===this.focused))this.focused=this.order.at(-1)||this.panes.at(-1)?.id||null;
  if(this.focused)this.raise(this.focused);
 }
}
