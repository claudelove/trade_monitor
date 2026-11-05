import {basicSetup} from 'codemirror';
import {EditorView,keymap} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {indentWithTab,historyField} from '@codemirror/commands';
import {python,pythonLanguage} from '@codemirror/lang-python';
import {StreamLanguage,HighlightStyle,syntaxHighlighting} from '@codemirror/language';
import {toml} from '@codemirror/legacy-modes/mode/toml';
import {tags} from '@lezer/highlight';
import {setDiagnostics as lintDiagnostics} from '@codemirror/lint';
import {autocompletion} from '@codemirror/autocomplete';

const theme=EditorView.theme({
 '&':{height:'100%',backgroundColor:'var(--bg,#00151e)',color:'#e2e8ec',fontFamily:'var(--font-code,monospace)',fontSize:'13px'},
 '.cm-scroller':{overflow:'auto',fontFamily:'inherit',lineHeight:'1.55'},
 '.cm-content':{padding:'8px 0',caretColor:'#ffad27'},
 '.cm-line':{padding:'0 10px'},
 '.cm-gutters':{backgroundColor:'#102731',color:'#859ba6',borderRight:'1px solid #29434e'},
 '.cm-activeLine,.cm-activeLineGutter':{backgroundColor:'#12313e'},
 '&.cm-focused .cm-selectionBackground,.cm-selectionBackground,::selection':{backgroundColor:'#234f68!important'},
 '.cm-cursor':{borderLeftColor:'#ffad27'},
 '.cm-panels,.cm-tooltip':{backgroundColor:'#18323e',color:'#e2e8ec',border:'1px solid #4c626e'},
 '.cm-search input':{color:'#111',backgroundColor:'#ffad27'},
 '.cm-foldPlaceholder':{backgroundColor:'#243c46',color:'#ffad27',border:0},
 '.cm-tooltip-autocomplete > ul > li[aria-selected]':{backgroundColor:'#14557e',color:'#fff'}
},{dark:true});
const highlighting=HighlightStyle.define([
 {tag:[tags.keyword,tags.modifier],color:'#ffad27'},
 {tag:[tags.string,tags.special(tags.string)],color:'#9bd5a2'},
 {tag:[tags.number,tags.bool,tags.null],color:'#86c6ef'},
 {tag:[tags.comment],color:'#8a9fa9',fontStyle:'italic'},
 {tag:[tags.function(tags.variableName),tags.definition(tags.variableName)],color:'#f0d285'}
]);
const contextCompletions=['as_of','history','positions','instruments','equity','halted'].map(label=>({label,type:'property'}));
export function attachCodeEditor(textarea,{language='python',onSave=()=>{},onRun=()=>{},onCursor=()=>{},remember={}}={}){
 const win=textarea.ownerDocument.defaultView;
 // Native textarea remains usable in non-layout clients, including DOM tests.
 if(typeof win.Range?.prototype.getClientRects!=='function')return {setText:v=>{textarea.value=v},setVisible:v=>{textarea.hidden=!v},setDiagnostics:()=>{},focus:()=>textarea.focus(),dispose:()=>{}};
 const host=textarea.ownerDocument.createElement('div');host.className='terminal-code-editor';host.hidden=textarea.hidden;textarea.after(host);textarea.hidden=true;
 let silent=false;
 const extensions=[basicSetup,language==='python'?python():StreamLanguage.define(toml),theme,syntaxHighlighting(highlighting),EditorView.contentAttributes.of({'aria-label':textarea.getAttribute('aria-label')||'Code editor'}),keymap.of([indentWithTab,{key:'Mod-s',run:()=>{onSave();return true}},{key:'Mod-Enter',run:()=>{onRun();return true}}]),
 autocompletion(),pythonLanguage.data.of({autocomplete:context=>{const match=context.matchBefore(/context\.\w*/);return match?{from:match.from+8,options:contextCompletions}:null}}),
 EditorView.updateListener.of(update=>{if(update.selectionSet||update.docChanged){const head=update.state.selection.main.head,line=update.state.doc.lineAt(head);onCursor(line.number,head-line.from+1)}if(update.docChanged&&!silent){textarea.value=update.state.doc.toString();textarea.dispatchEvent(new win.Event('input',{bubbles:true}))}})];
 const config={doc:textarea.value,extensions};
 let state;try{state=remember.snapshot?.doc===textarea.value?EditorState.fromJSON(remember.snapshot,config,{history:historyField}):EditorState.create(config)}catch{state=EditorState.create(config)}
 const view=new EditorView({parent:host,root:textarea.getRootNode(),state});
 if(remember.scrollTop)view.scrollDOM.scrollTop=remember.scrollTop;
 const setText=value=>{if(view.state.doc.toString()===value)return;silent=true;try{view.dispatch({changes:{from:0,to:view.state.doc.length,insert:value}});textarea.value=value}finally{silent=false}};
 const sync=()=>setText(textarea.value);textarea.addEventListener('input',sync);
 return {setText,setVisible:visible=>{host.hidden=!visible;if(visible)view.requestMeasure()},setDiagnostics:items=>{const diagnostics=items.map(item=>{const line=view.state.doc.line(Math.min(Math.max(1,item.line||1),view.state.doc.lines)),from=Math.min(line.to,line.from+Math.max(0,(item.column||1)-1));return {from,to:Math.min(line.to,from+1),severity:item.severity||'error',message:item.message}});view.dispatch(lintDiagnostics(view.state,diagnostics))},focus:(line=1,column=1)=>{const row=view.state.doc.line(Math.min(Math.max(1,line),view.state.doc.lines));view.dispatch({selection:{anchor:Math.min(row.to,row.from+Math.max(0,column-1))},scrollIntoView:true});view.focus()},dispose:()=>{remember.snapshot=view.state.toJSON({history:historyField});remember.scrollTop=view.scrollDOM.scrollTop;textarea.removeEventListener('input',sync);view.destroy();host.remove();textarea.hidden=false}};
}
