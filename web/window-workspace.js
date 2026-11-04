const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import {screens} from './screens.js';
export const tools=Object.fromEntries(screens.list.filter(s=>s.kind==='screen'&&s.panel!==false).map(s=>[s.id,s.number+' '+s.command+' / '+s.title]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const initial=(profile,registry)=>{const defaults=registry.defaults(profile),rows=Math.max(1,Math.ceil(defaults.length/2));return defaults.map((screen,i)=>({id:'pane-'+(i+1),type:screen.id,x:i%2*.5,y:Math.floor(i/2)/rows,w:defaults.length%2&&i===defaults.length-1?1:.5,h:1/rows,minimized:false}))};
export class WindowWorkspace {
 constructor({storage,content,bind,symbols,profile='strategy',registry=screens}){
  Object.assign(this,{storage,content,bind,symbols,profile,registry});this.cleanups=[];this.tools=Object.fromEntries(registry.panels(profile).map(s=>[s.id,s.number+' '+s.command+' / '+s.title]));this.storageKey='catalyst-window-layout-v3-'+profile;this.root=null;this.serial=0;this.focused=null;this.maximized=null;this.editing=false;
  try{const saved=JSON.parse(storage.getItem(this.storageKey));if(!Array.isArray(saved)||saved.length>12)throw Error();this.panes=saved.map(p=>{if(!Object.hasOwn(this.tools,p.type)||typeof p.id!=='string'||!/^pane-\d+$/.test(p.id)||!['x','y','w','h'].every(k=>Number.isFinite(p[k])))throw Error();return {id:p.id,type:p.type,x:clamp(p.x,0,.8),y:clamp(p.y,0,.9),w:clamp(p.w,.2,1),h:clamp(p.h,.15,1),minimized:p.minimized===true}});this.panes.forEach(p=>{p.x=Math.min(p.x,1-p.w);p.y=Math.min(p.y,1-p.h)});if(new Set(this.panes.map(p=>p.id)).size!==this.panes.length)throw Error()}catch{this.panes=initial(this.profile,this.registry)}
  this.serial=Math.max(0,...this.panes.map(p=>Number(p.id.slice(5))));
 }
 save(){try{this.storage.setItem(this.storageKey,JSON.stringify(this.panes.map(({id,type,x,y,w,h,minimized})=>({id,type,x,y,w,h,minimized}))))}catch{}}
 open(type,parameters=null){const params=typeof parameters==='string'?{symbol:parameters}:parameters||{};if(!Object.hasOwn(this.tools,type))return;let created=false;let pane=!this.registry.get(type).repeatable&&this.panes.find(p=>p.type===type);if(!pane){created=true;if(this.panes.length>=12){this.message('창은 최대 12개까지 열 수 있습니다.');return}const offset=this.panes.length%6*.035;pane={id:'pane-'+(++this.serial),type,x:.04+offset,y:.04+offset,w:.52,h:.56,minimized:false};this.panes.push(pane)}for(const [key,value]of Object.entries(params))if(!['id','type','x','y','w','h'].includes(key))pane[key]=value;pane.minimized=false;this.maximized=null;this.focused=pane.id;if(!this.editing&&created){this.tile()}else{this.save();this.render()}this.raise(pane.id)}
 reset(){this.panes=initial(this.profile,this.registry);this.serial=this.panes.length;this.maximized=null;this.save();this.render()}
 tile(){const count=this.panes.length;if(!count){this.maximized=null;this.save();this.render();return}const cols=count<=4?2:3,rows=Math.ceil(count/cols);this.panes.forEach((p,i)=>{const rowCount=Math.min(cols,count-Math.floor(i/cols)*cols);Object.assign(p,{x:(i%cols)/rowCount,y:Math.floor(i/cols)/rows,w:1/rowCount,h:1/rows,minimized:false})});this.maximized=null;this.save();this.render()}
 message(text){if(this.root)this.root.querySelector('[data-workspace-status]').textContent=text}
 raise(id){this.focused=id;this.panes.forEach(p=>{const el=this.root?.querySelector('[data-pane="'+p.id+'"]');if(el){el.style.zIndex=p.id===id?'20':String(this.panes.indexOf(p)+1);el.classList.toggle('focused',p.id===id)}})}
 geometry(pane,element){const maximized=this.maximized===pane.id;Object.assign(element.style,{left:(maximized?0:pane.x*100)+'%',top:(maximized?0:pane.y*100)+'%',width:(maximized?100:pane.w*100)+'%',height:pane.minimized?'30px':(maximized?100:pane.h*100)+'%'});element.classList.toggle('is-maximized',maximized);element.classList.toggle('is-minimized',pane.minimized)}
 disposePanels(){for(const off of this.cleanups.splice(0))off()}
 dispose(){this.disposePanels();this.root=null}
 mount(root){this.root=root;this.render()}
 render(){this.disposePanels();if(!this.root?.isConnected)return;const document=this.root.ownerDocument;this.root.innerHTML=`<div class="desktop-toolbar"><div class="screen-menu" aria-label="작업공간 소화면">${Object.entries(this.tools).map(([key,title])=>`<button class="button secondary" data-open-tool="${key}">${escape(this.registry.get(key).title)}</button>`).join('')}</div><span data-workspace-status role="status"></span></div><div class="workspace-canvas ${this.editing?'editing':''}" id="workspace-canvas" aria-label="다중 창 워크스페이스"></div>`;
  this.root.querySelectorAll('[data-open-tool]').forEach(button=>button.onclick=()=>this.open(button.dataset.openTool));
  const canvas=this.root.querySelector('.workspace-canvas');if(!this.panes.length)canvas.innerHTML='<div class="empty">창 추가 또는 명령창에서 필요한 화면을 여세요.</div>';
  for(const pane of this.panes){
   const element=document.createElement('section');element.className='tool-window';element.dataset.pane=pane.id;element.dataset.tool=pane.type;element.setAttribute('aria-label',this.tools[pane.type]);
   if(pane.symbol&&!this.symbols().some(s=>s.symbol===pane.symbol))pane.symbol=null;
   element.innerHTML=`<div class="window-titlebar" tabindex="0" role="group" aria-label="${escape(this.tools[pane.type])}"><span class="window-number">${escape(pane.id.replace('pane-','#'))}</span><select data-pane-tool aria-label="이 패널의 기능">${Object.entries(this.tools).map(([key,title])=>`<option value="${key}" ${key===pane.type?'selected':''}>${title}</option>`).join('')}</select><div class="window-buttons"><button data-window-action="maximize" aria-label="창 최대화 또는 복원">□</button><button data-window-action="close" aria-label="창 닫기">×</button></div></div><div class="window-body">${this.content(pane).replace(/\bid="([^"]+)"/g,'data-field="$1"')}</div>`;
   canvas.append(element);this.geometry(pane,element);element.addEventListener('pointerdown',()=>this.raise(pane.id));
   element.querySelectorAll('[data-window-action]').forEach(button=>button.onclick=()=>{const action=button.dataset.windowAction;if(action==='close'){this.panes=this.panes.filter(p=>p!==pane);if(this.maximized===pane.id)this.maximized=null}else{pane.minimized=false;this.maximized=this.maximized===pane.id?null:pane.id}if(action==='close'&&!this.editing){this.tile();return}this.save();this.render();this.raise(pane.id)});
   element.querySelector('[data-pane-tool]').onchange=event=>{pane.type=event.target.value;pane.symbol=null;pane.range='60';this.save();this.render()};
   element.querySelector('.window-titlebar').ondblclick=event=>{if(!event.target.closest('button,select')){this.maximized=this.maximized===pane.id?null:pane.id;this.render()}};

   const off=this.bind(element.querySelector('.window-body'),pane);if(typeof off==='function')this.cleanups.push(off);
  }
  if(this.focused)this.raise(this.focused);
 }
}
