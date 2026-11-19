import {esc,listen} from '../ui/dom.js';
import {attachCodeEditor} from '../shared/ui/code-editor.js';
import {renderTable} from '../shared/ui/table.js';
const prefix='/api/v1/operations/';

export default {
 id:'broker',number:'0504',command:'BROKER',aliases:['DEMO','TRADE','OPERATE'],desk:'execution',title:'Operating Code / KIS DEMO',defaultSlot:0,
 render(ctx,pane={}){return `<div class="function-actions"><b>OPERATING CODE / KIS DEMO</b><span>ONE CONNECTED ACCOUNT · MULTIPLE STRATEGIES · REAL DISABLED</span></div><div class="strategy-toolbar"><button data-program-check>CHECK CODE</button><button data-program-apply disabled>APPLY REVIEWED CODE</button><button data-program-reload hidden>LOAD APPLIED CODE</button></div><p class="section-note">Edit ACCOUNT settings and STRATEGIES below. Strategy capital, risk, execution, Python source and manifest stay in this document. CHECK never runs strategy code. APPLY does not start orders.</p><div data-program-message role="status" aria-live="polite" aria-busy="true">Connecting to the protected operating service…</div><textarea class="source-editor" data-program-source aria-label="Operating Python declarations" spellcheck="false">${esc(pane.program||'')}</textarea><pre class="raw-evidence" data-program-preview></pre><div class="toolbar"><button data-program-command="start" disabled>START DEMO</button><button data-program-command="pause" disabled>PAUSE</button><button data-program-command="stop" disabled>STOP</button><button data-program-command="flatten" hidden disabled>FLATTEN HOLDINGS</button></div><p class="section-note">START uses applied code and can send virtual-money orders. PAUSE blocks new signals and requests cancellation. STOP retains holdings. ACK is not a fill.</p><div data-program-state role="status"></div>`},
 mount(root,ctx,pane={}){
  const q=s=>root.querySelector(s),win=root.ownerDocument.defaultView,text=q('[data-program-source]');
  let disposed=false,busy=false,available=false,polling=false,generation=0,account=null,revision=null,preview=null,hasHoldings=false;
  pane.programBuffer??={};
  const editor=attachCodeEditor(text,{language:'python',remember:pane.programBuffer,onSave:()=>check(),onRun:()=>check()});
  const say=(message,loading=false)=>{if(disposed)return;q('[data-program-message]').textContent=message;q('[data-program-message]').setAttribute('aria-busy',String(loading))};
  const controls=()=>{q('[data-program-check]').disabled=busy||!available;q('[data-program-apply]').disabled=busy||!available||!preview;q('[data-program-reload]').hidden=!pane.dirty&&!pane.stale;q('[data-program-reload]').disabled=busy;for(const button of root.querySelectorAll('[data-program-command]')){button.disabled=busy||!available||!account;button.hidden=button.dataset.programCommand==='flatten'&&!hasHoldings}};
  const invalidate=()=>{preview=null;pane.review=null;pane.program=text.value;pane.dirty=true;q('[data-program-preview]').textContent='Changed code: CHECK again before applying.';controls()};
  const post=(path,body)=>ctx.actions.operation(prefix+path,body,{signal:ctx.signal});
  const reason=error=>error?.message||String(error);
  async function poll(){if(disposed||polling||!account)return;polling=true;const token=generation,id=account;
   try{const values=await Promise.allSettled(['demo','readiness?purpose=signal','snapshot','execution'].map(path=>ctx.actions.api(prefix+'accounts/'+encodeURIComponent(id)+'/'+path,{signal:ctx.signal})));
    if(disposed||token!==generation)return;
    const [state,ready,snapshot,orders]=values.map(v=>v.status==='fulfilled'?v.value:null);
    revision=state?.policy_revision||revision;if(pane.baseRevision&&revision!==pane.baseRevision)pane.stale=true;
    hasHoldings=Object.values(snapshot?.positions||{}).some(value=>Number(value)!==0);
    q('[data-program-state]').innerHTML=renderTable({columns:[{key:'worker',label:'WORKER'},{key:'desired',label:'REQUESTED'},{key:'nav',label:'LAST ACCOUNT NAV / KRW',type:'number',unit:'KRW',numeric:true},{key:'gate',label:'ACCOUNT GATES'}],rows:[{worker:state?.heartbeat?.status||'UNAVAILABLE',desired:state?.desired?.desired||'—',nav:snapshot?.nav_krw??null,gate:ready?(ready.can_start?'READY':(ready.constraints||[]).map(x=>x.code).filter((v,i,a)=>a.indexOf(v)===i).join(', ')||'BLOCKED'):'UNAVAILABLE'}]})+renderTable({columns:[{key:'strategy',label:'STRATEGY'},{key:'state',label:'ORDER STATE'},{key:'filled',label:'FILLED',numeric:true}],rows:(orders?.orders||[]).map(row=>({strategy:row.strategy_id,state:row.state,filled:row.filled_quantity??row.filled??null}))});
   }catch(error){if(!disposed)say('Status unavailable: '+reason(error))}finally{polling=false;if(!disposed)controls()}
  }
  async function load(force=false){if(busy)return;if(force&&pane.dirty&&!win.confirm('Discard unsaved operating code and load the applied document?'))return;busy=true;controls();say('LOADING APPLIED OPERATING CODE…',true);
   try{const value=await ctx.actions.api(prefix+'program',{signal:ctx.signal});if(disposed)return;account=value.account_id;revision=value.revision;available=true;
    if(force||pane.program===undefined){editor.setText(value.program);pane.program=value.program;pane.baseRevision=value.revision;pane.dirty=false;pane.stale=false;preview=null;q('[data-program-preview]').textContent='Applied sources loaded. No code executed and no orders sent.'}
    else{pane.baseRevision??=value.revision;pane.stale=pane.baseRevision!==value.revision}
    say(pane.stale?'Applied policy changed. Your edits are kept; load applied code before checking.':'KIS DEMO connected. Edit code → CHECK → APPLY → START.');await poll();
   }catch(error){available=false;say('OPERATING SERVICE UNAVAILABLE · '+reason(error))}finally{busy=false;if(!disposed)controls()}
  }
  async function check(){if(busy||!available)return;const source=text.value,base=pane.baseRevision;busy=true;preview=null;controls();say('CHECKING EXACT CODE / CAPITAL / RISK…',true);
   try{const value=await post('program/check',{program:source,expected_revision:base});if(disposed)return;if(text.value!==source){say('Code changed during check. Check the current code again.');return}
    preview=value;pane.review=value;q('[data-program-preview]').textContent=JSON.stringify({strategies:value.strategies,total_capital_krw:value.total_capital_krw,warnings:value.warnings,review:value.program_sha256},null,2);say('CHECKED / review the exact code and settings, then APPLY. No strategy executed.');
   }catch(error){say('CHECK BLOCKED · '+reason(error))}finally{busy=false;if(!disposed)controls()}
  }
  async function apply(){if(busy||!preview)return;const checked=preview,source=text.value;busy=true;controls();say('APPLYING REVIEWED CODE / NO START COMMAND…',true);
   try{const value=await post('program/apply',{review_id:checked.review_id,program_sha256:checked.program_sha256,reviewed:true});if(disposed)return;pane.baseRevision=value.revision;revision=value.revision;preview=null;
    if(text.value===source){pane.dirty=false;pane.stale=false}say('APPLIED / strategy worker not started. START DEMO is separate.');await poll();
   }catch(error){say('APPLY NOT CONFIRMED · '+reason(error)+' · Retry the same checked document.')}finally{busy=false;if(!disposed)controls()}
  }
  const off=[listen(text,'input',invalidate),listen(root,'click',async event=>{const button=event.target.closest('button');if(!button)return;
   if(button.matches('[data-program-check]'))return check();if(button.matches('[data-program-apply]'))return apply();if(button.matches('[data-program-reload]'))return load(true);
   if(!button.matches('[data-program-command]')||busy||!account)return;
   const action=button.dataset.programCommand;if(action==='start'&&(pane.dirty||pane.stale))return say('Unapplied edits exist. CHECK and APPLY, or load the applied code, before START.');
   busy=true;controls();const identity=[account,revision,action].join(':');if(pane.commandRequest?.identity!==identity)pane.commandRequest={identity,id:crypto.randomUUID().replaceAll('-','')};
   try{await post('accounts/'+encodeURIComponent(account)+'/demo/commands',{action,expected_revision:revision,request_id:pane.commandRequest.id});if(disposed)return;pane.commandRequest=null;say('COMMAND ACCEPTED / inspect actual worker and order states.');await poll()}catch(error){say('COMMAND NOT CONFIRMED · '+reason(error))}finally{busy=false;if(!disposed)controls()}
  }),listen(win,'beforeunload',event=>{if(pane.dirty){event.preventDefault();event.returnValue=''}})];
  load();const timer=setInterval(poll,2000);controls();return()=>{disposed=true;generation++;clearInterval(timer);off.forEach(f=>f());editor.dispose()};
 }
};
