import {newsView} from '../terminal-ui.js';
import {field,listen} from '../ui/dom.js';
export default {id:'news',number:'0203',command:'TOP',desk:'market',title:'News',subtitle:'Search stored source headlines.',nav:false,navOrder:12,navLabel:'NEWS',defaultSlot:2,render:(ctx,pane)=>newsView(ctx.state.data,pane.query||''),mount(root,ctx,pane){const input=field(root,'news-search');if(!input)return ()=>{};return listen(input,'input',()=>{pane.query=input.value;const box=root.ownerDocument.createElement('div');box.innerHTML=newsView(ctx.state.data,pane.query);field(root,'news-results').innerHTML=field(box,'news-results').innerHTML;field(root,'news-count').textContent=field(box,'news-count').textContent})}};

