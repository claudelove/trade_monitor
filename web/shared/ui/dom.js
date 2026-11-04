const scopes=new WeakMap();
export function mountScope(root){scopes.get(root)?.abort();const controller=new root.ownerDocument.defaultView.AbortController();scopes.set(root,controller);return {signal:controller.signal,abort(){controller.abort();if(scopes.get(root)===controller)scopes.delete(root)}}}
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const field=(root,name)=>root.querySelector(`[data-field="${name}"], [id="${name}"]`);
export function listen(root,event,handler,options){let parent=root,scope;while(parent&&!scope){scope=scopes.get(parent);parent=parent.parentElement}const config=typeof options==='boolean'?{capture:options}:{...options};if(scope)config.signal=scope.signal;if(!root)return ()=>{};root.addEventListener(event,handler,config);return ()=>root.removeEventListener(event,handler,config)}
