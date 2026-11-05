import {listen} from './dom.js';
// Application callbacks own layout/state. This module owns only input semantics and cleanup.
export function bindWindowChrome(element,{onFocus=()=>{},onAction=()=>{},onToggleMaximize=()=>{}}={}){
 const title=element.querySelector('.window-titlebar');
 const off=[listen(element,'pointerdown',onFocus),listen(element,'click',event=>{
  const button=event.target.closest('[data-window-action]');
  if(button&&title?.contains(button))onAction(button.dataset.windowAction,event);
 }),listen(title,'dblclick',event=>{if(!event.target.closest('button,select,input,textarea,a'))onToggleMaximize(event)}),
 listen(title,'keydown',event=>{if(event.target===title&&['Enter',' '].includes(event.key)){event.preventDefault();if(!event.repeat&&!event.isComposing)onToggleMaximize(event)}})];
 let done=false;return ()=>{if(done)return;done=true;off.forEach(dispose=>dispose())};
}

// Normalized geometry is supplied/owned by the application. No registry or storage access.
export function bindWindowGeometry(element,{bounds,getGeometry,onChange,onCommit=()=>{},enabled=()=>true}={}){
 const doc=element.ownerDocument,view=doc.defaultView,title=element.querySelector('.window-titlebar');
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));let active=null,done=false;
 const apply=(start,dx,dy,edge,box)=>{
  const minW=Math.min(1,280/box.width),minH=Math.min(1,180/box.height);
  let {x,y,w,h}=start;
  if(!edge){x=clamp(x+dx,0,1-w);y=clamp(y+dy,0,1-h)}
  else{
   if(edge.includes('e'))w=clamp(w+dx,Math.min(minW,1-x),1-x);
   if(edge.includes('s'))h=clamp(h+dy,Math.min(minH,1-y),1-y);
   if(edge.includes('w')){const right=x+w;x=clamp(x+dx,0,right-Math.min(minW,w));w=right-x}
   if(edge.includes('n')){const bottom=y+h;y=clamp(y+dy,0,bottom-Math.min(minH,h));h=bottom-y}
  }
  onChange({x,y,w,h});
 };
 const finish=cancel=>{
  if(!active)return;const previous=active;active=null;
  if(cancel)onChange(previous.start);else onCommit();
  try{previous.target.releasePointerCapture?.(previous.id)}catch{}
  element.classList.remove('is-positioning');
  doc.removeEventListener('pointermove',move);doc.removeEventListener('pointerup',up);doc.removeEventListener('pointercancel',cancelPointer);doc.removeEventListener('keydown',escape);view.removeEventListener('blur',cancelBlur);
 };
 const move=e=>{if(!active||e.pointerId!==active.id)return;e.preventDefault();apply(active.start,(e.clientX-active.x)/active.box.width,(e.clientY-active.y)/active.box.height,active.edge,active.box)};
 const up=e=>{if(e.pointerId===active?.id)finish(false)};
 const cancelPointer=e=>{if(e.pointerId===active?.id)finish(true)};
 const escape=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(true)}};
 const cancelBlur=()=>finish(true);
 const off=[listen(element,'pointerdown',e=>{
  const handle=e.target.closest('[data-window-resize]');
  if(done||active||e.button!==0||!enabled()||(!handle&&!title?.contains(e.target))||e.target.closest('button,select,input,textarea,a'))return;
  const box=bounds().getBoundingClientRect();if(!box.width||!box.height)return;
  e.preventDefault();active={id:e.pointerId,target:e.target,x:e.clientX,y:e.clientY,edge:handle?.dataset.windowResize||'',box,start:{...getGeometry()}};
  element.classList.add('is-positioning');try{e.target.setPointerCapture?.(e.pointerId)}catch{}
  title?.focus({preventScroll:true});doc.addEventListener('pointermove',move,{passive:false});doc.addEventListener('pointerup',up);doc.addEventListener('pointercancel',cancelPointer);doc.addEventListener('keydown',escape);view.addEventListener('blur',cancelBlur);
 }),listen(element,'keydown',e=>{
  const handle=e.target.closest('[data-window-resize]');
  if(!enabled()||(!handle&&e.target!==title)||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  const box=bounds().getBoundingClientRect();if(!box.width||!box.height)return;
  e.preventDefault();e.stopPropagation();const step=e.shiftKey?20:5;
  apply(getGeometry(),(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0)/box.width,(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)/box.height,handle?.dataset.windowResize||'',box);onCommit();
 })];
 return ()=>{if(done)return;done=true;finish(true);off.forEach(dispose=>dispose())};
}
