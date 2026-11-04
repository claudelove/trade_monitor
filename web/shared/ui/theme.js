export const THEME_EVENT='terminal-ui:theme-change';
const numeric={typeScale:['--ui-type-scale',.75,1.5,''],letterSpacing:['--ui-letter-spacing',-1,3,'px'],wordSpacing:['--ui-word-spacing',-2,8,'px'],lineHeight:['--ui-line-height',1.1,1.8,''],chartFontSize:['--chart-font-size',8,24,'px']};
const colors={text:'--text',muted:'--muted',accent:'--accent',background:'--bg',positive:'--positive',negative:'--negative'};
export function setTheme(root,settings){
 if(!root?.style||!settings||Array.isArray(settings)||typeof settings!=='object')throw Error('Theme requires an element and settings object');
 const entries=[];
 for(const [key,value]of Object.entries(settings)){
  if(numeric[key]){const [token,min,max,unit]=numeric[key];if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error('Invalid theme value: '+key);entries.push([token,value+unit]);}
  else if(colors[key]){if(typeof value!=='string'||!/^#[a-f0-9]{6}$/i.test(value))throw Error('Theme colors require #RRGGBB');entries.push([colors[key],value]);}
  else if(key==='fontFamily'){if(typeof value!=='string'||!value.trim()||value.length>256||/[;{}<>\n\r]/.test(value))throw Error('Invalid font family');entries.push(['--font-ui',value]);}
  else throw Error('Unknown theme setting: '+key);
 }
 // Validate everything before applying; no persistence or network side effects.
 for(const [key,value]of entries)root.style.setProperty(key,value);
 const view=root.ownerDocument.defaultView;root.dispatchEvent(new view.CustomEvent(THEME_EVENT,{bubbles:true}));
}
export function readTypography(root){
 const view=root.ownerDocument.defaultView,css=view.getComputedStyle(root),number=(token,fallback)=>{const value=parseFloat(css.getPropertyValue(token));return Number.isFinite(value)&&value>0?value:fallback};
 return {fontFamily:css.getPropertyValue('--font-ui').trim()||css.fontFamily||'monospace',fontSize:number('--chart-font-size',11)*number('--ui-type-scale',1),textColor:css.getPropertyValue('--text').trim()||'#e7e7e7',background:{type:'solid',color:css.getPropertyValue('--bg').trim()||'#000000'}};
}
export function watchTypography(root,onChange){
 const doc=root.ownerDocument,view=doc.defaultView;let active=true;
 const update=()=>{if(active)onChange(readTypography(root))};doc.addEventListener(THEME_EVENT,update);
 doc.fonts?.addEventListener?.('loadingdone',update);doc.fonts?.ready?.then(update);
 // CSS classes/styles can be changed without the JS helper. Observe ancestor changes only.
 const observer=view.MutationObserver?new view.MutationObserver(update):null;
 for(let node=root;node;node=node.parentElement)observer?.observe(node,{attributes:true,attributeFilter:['style','class']});
 return ()=>{if(!active)return;active=false;doc.removeEventListener(THEME_EVENT,update);doc.fonts?.removeEventListener?.('loadingdone',update);observer?.disconnect()};
}
