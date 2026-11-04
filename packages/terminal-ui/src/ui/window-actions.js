import {listen} from './dom.js';
// Application callbacks own layout/state. This module owns only input semantics and cleanup.
export function bindWindowChrome(element,{onFocus=()=>{},onAction=()=>{},onToggleMaximize=()=>{}}={}){
 const title=element.querySelector('.window-titlebar');
 const off=[listen(element,'pointerdown',onFocus),listen(element,'click',event=>{
  const button=event.target.closest('[data-window-action]');
  if(button&&title?.contains(button))onAction(button.dataset.windowAction,event);
 }),listen(title,'dblclick',event=>{if(!event.target.closest('button,select,input,textarea,a'))onToggleMaximize(event)}),
 listen(title,'keydown',event=>{if(event.target===title&&['Enter',' '].includes(event.key)){event.preventDefault();onToggleMaximize(event)}})];
 let done=false;return ()=>{if(done)return;done=true;off.forEach(dispose=>dispose())};
}
