import {esc,listen} from '../ui/dom.js';
import {attachCodeEditor} from '../shared/ui/code-editor.js';
import {defaultSource,defaultManifest,managedManifest,strategyTemplates} from '../views/strategy-skeleton.js';

export default {
 id:'strategy-lab',number:'0304',legacyNumbers:['0109','0301','0303','0305'],command:'CODE',aliases:['LAB','NEW','STRATEGY','PYTHON','SOURCE','STRAT','BTEXEC'],desk:'backtest',title:'Strategy Workbench',defaultSlot:0,
 render(ctx,pane){
  pane.source??=defaultSource;pane.manifest??=managedManifest;
  const today=new Date(),yesterday=new Date(today.getTime()-86400000),yearAgo=new Date(yesterday);yearAgo.setUTCFullYear(yearAgo.getUTCFullYear()-1);
  const day=d=>d.toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
  pane.conditions??={start:day(yearAgo),end:day(yesterday),adjustment:'original',cohort_mode:'as_of_start',acknowledge_current_cohort:false,rank_limit:null,minimum_listing_days:0,min_observations:60};const c=pane.conditions;
  return `<div class="strategy-toolbar"><b>STRATEGY WORKBENCH</b><button data-code-save>SAVE VERSION</button><span class="muted">Ctrl/⌘ S · save / Ctrl/⌘ Enter · backtest</span></div>
  <details><summary>LOAD VERSION / NEW CODE TEMPLATE</summary><div class="strategy-versions"><label>VERSION<select data-code-version aria-label="Saved strategy version"><option value="">UNSAVED</option></select></label><button data-code-load>LOAD</button><label>TEMPLATE<select data-code-template aria-label="Strategy template">${Object.entries(strategyTemplates).map(([key,t])=>`<option value="${key}">${esc(t.label)}</option>`).join('')}</select></label><button data-code-skeleton>NEW FROM TEMPLATE</button></div></details>
  <div class="strategy-workbench"><section class="strategy-editor-area"><div class="strategy-tabs"><button data-code-tab="source" aria-pressed="${pane.editorTab!=='manifest'}">PYTHON</button><button data-code-tab="manifest" aria-pressed="${pane.editorTab==='manifest'}">SIGNAL / RISK / EXECUTION</button><span data-code-position>Ln 1, Col 1</span></div>
  <textarea class="source-editor" data-code-source aria-label="Python strategy code" spellcheck="false" ${pane.editorTab==='manifest'?'hidden':''}>${esc(pane.source)}</textarea><textarea class="source-editor" data-code-manifest aria-label="Strategy risk and execution TOML" spellcheck="false" ${pane.editorTab!=='manifest'?'hidden':''}>${esc(pane.manifest)}</textarea>
  <div data-code-status role="status">${esc(pane.message||'Implement the contract hooks, or select the explicit synthetic reference template. No code runs on save.')}</div>
  <div data-code-diagnostics aria-label="Strategy diagnostics"></div></section>
  <aside class="strategy-run-panel"><div class="section-bar">BACKTEST THIS STRATEGY</div><div data-code-universe-info class="section-note" role="status" aria-busy="true">Loading saved default universe…</div><div class="strategy-toolbar"><button data-code-universe-open>UNIVERSE SETTINGS</button></div><div class="research-conditions"><label>FROM<input type="date" data-code-condition="start" value="${esc(c.start)}" aria-label="Research start"></label><label>THROUGH<input type="date" data-code-condition="end" value="${esc(c.end)}" aria-label="Research end"></label><label class="wide">PRICES<select data-code-condition="adjustment"><option value="original" ${c.adjustment==='original'?'selected':''}>ORIGINAL</option><option value="adjusted" ${c.adjustment==='adjusted'?'selected':''}>LATEST ADJUSTED / NOT PIT</option></select></label><label class="wide">COHORT BASIS<select data-code-condition="cohort_mode"><option value="as_of_start" ${c.cohort_mode==='as_of_start'?'selected':''}>KNOWN AT RESEARCH START</option><option value="current_cohort" ${c.cohort_mode==='current_cohort'?'selected':''}>CURRENT COHORT / RETROSPECTIVE</option></select></label><label>MAX UNIVERSE RANK<input type="number" min="1" max="100" placeholder="ALL" data-code-condition="rank_limit" value="${c.rank_limit??''}"></label><label>LISTED DAYS AT START<input type="number" min="0" max="36500" data-code-condition="minimum_listing_days" value="${c.minimum_listing_days}"></label><label>MIN OBSERVATIONS<input type="number" min="2" max="100000" data-code-condition="min_observations" value="${c.min_observations}"></label><label class="review-check"><input type="checkbox" data-code-condition="acknowledge_current_cohort" ${c.acknowledge_current_cohort?'checked':''}>For current-cohort research I accept survivorship bias; it is not a historical point-in-time universe.</label></div><label class="review-check"><input type="checkbox" data-code-reviewed ${pane.reviewed?'checked':''}>I reviewed this code, policy, saved universe and conditions. Run it as trusted Python on the server.</label><button data-code-run disabled>BACKTEST THIS STRATEGY</button><p class="section-note">Validates and saves the current content, then resolves members and cached/provider data automatically. No ticker or dataset selection is required. Saving alone never starts execution.</p>
  <div class="section-bar">EXECUTION STATUS</div><label>RECENT BACKTESTS<select data-code-history aria-label="Recent strategy backtests"><option value="">NONE</option></select></label><div data-code-job role="status"></div><div class="strategy-toolbar"><button data-code-stop disabled>STOP BACKTEST</button><button data-code-results disabled>OPEN RESULT</button></div>
  <details><summary>Effective risk / execution settings</summary><pre data-code-effective>Validate to inspect the exact engine settings.</pre></details><p class="section-note">Historical bar API v1. Continuous KIS DEMO controls are in BROKER [0504]. Real order dispatch remains disabled.</p></aside></div>`;
 },
 mount(root,ctx,pane){
  const q=s=>root.querySelector(s),win=root.ownerDocument.defaultView;
  const source=q('[data-code-source]'),manifest=q('[data-code-manifest]');
  let disposed=false,timer=null,working=false,versions=[],catalog=null;
  const show=text=>{pane.message=text;q('[data-code-status]').textContent=text};
  const running=()=>['running','stop_requested','preparing_data','waiting_credentials','waiting_worker','waiting_worker_recovery'].includes(pane.job?.status);
  const controls=()=>{
   for(const selector of ['[data-code-save]','[data-code-load]','[data-code-skeleton]'])q(selector).disabled=working;
   q('[data-code-run]').disabled=working||running()||!pane.reviewed||!catalog?.universe_settings?.default?.revision;
   q('[data-code-status]').setAttribute('aria-busy',String(working));q('[data-code-run]').textContent=working?'PREPARING…':'BACKTEST THIS STRATEGY';
   q('[data-code-stop]').disabled=working||!running();q('[data-code-stop]').hidden=!running();q('[data-code-results]').disabled=!pane.job?.run_id;q('[data-code-results]').hidden=!pane.job?.run_id;
   q('[data-code-reviewed]').checked=!!pane.reviewed;for(const input of root.querySelectorAll('[data-code-condition]'))input.disabled=working;
  };
  const markCursor=(line,column)=>{q('[data-code-position]').textContent=`Ln ${line}, Col ${column}`};
  pane.editorBuffers??={source:{},manifest:{}};
  const sourceEditor=attachCodeEditor(source,{language:'python',remember:pane.editorBuffers.source,onSave:()=>save(),onRun:()=>backtest(),onCursor:markCursor});
  const policyEditor=attachCodeEditor(manifest,{language:'toml',remember:pane.editorBuffers.manifest,onSave:()=>save(),onRun:()=>backtest(),onCursor:markCursor});
  const setTab=tab=>{pane.editorTab=tab;sourceEditor.setVisible(tab==='source');policyEditor.setVisible(tab==='manifest');for(const b of root.querySelectorAll('[data-code-tab]'))b.setAttribute('aria-pressed',String(b.dataset.codeTab===tab))};
  const drawDiagnostics=()=>{
   const ds=pane.validation?.diagnostics||[];sourceEditor.setDiagnostics(ds.filter(d=>d.file==='source'));policyEditor.setDiagnostics(ds.filter(d=>d.file==='manifest'));
   q('[data-code-diagnostics]').innerHTML=ds.map((d,i)=>`<button data-code-diagnostic="${i}" class="strategy-diagnostic">${esc(d.severity.toUpperCase())} / ${esc(d.file)}:${esc(d.line)}:${esc(d.column)} · ${esc(d.message)}</button>`).join('');
   q('[data-code-effective]').textContent=pane.validation?.effective_settings?JSON.stringify(pane.validation.effective_settings,null,2):'Validate to inspect the exact engine settings.';
  };
  const invalidate=()=>{pane.reviewed=false;pane.validation=null;drawDiagnostics();controls()};
  const drawJob=()=>{
   const j=pane.job;if(j){const option=Array.from(q('[data-code-history]').options).find(o=>o.value===j.job_id);if(option)option.textContent=jobLabel(j)}q('[data-code-job]').textContent=j?`${j.status.toUpperCase()}\nJOB ${j.job_id}\nVERSION ${j.code_version||'REGISTERED SOURCE'}\nUNIVERSE ${j.universe?.name||'LEGACY INPUT'} / ${j.member_count??j.selection?.members?.length??'—'} members\nRESOLVED DATA ${j.dataset||'PREPARING AUTOMATICALLY'}${j.error?'\n'+j.error:''}`:'No backtest started.';controls();
  };
  const poll=async()=>{
   clearTimeout(timer);if(disposed||!pane.job)return;const id=pane.job.job_id;
   try{const job=await ctx.actions.api((pane.job.kind==='universe_research'?'/api/v1/universes/research-jobs/':'/api/paper/jobs/')+encodeURIComponent(id),{signal:ctx.signal});if(disposed||pane.job?.job_id!==id)return;pane.job=job;drawJob();if(running())timer=setTimeout(poll,1000)}catch(e){if(!disposed)show('Job status unavailable: '+e.message+' · The server job may still be running.')}
  };
  const jobLabel=j=>new Date(j.created_at).toLocaleString('en-GB',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})+' KST / '+j.status.toUpperCase()+' / '+(j.universe?.name||j.dataset||'AUTO DATA');
  const refreshHistory=async()=>{
   try{const jobs=await ctx.actions.api('/api/strategy-lab/jobs',{signal:ctx.signal});if(disposed)return;pane.jobs=jobs;q('[data-code-history]').innerHTML='<option value="">SELECT A BACKTEST</option>'+jobs.map(j=>`<option value="${esc(j.job_id)}">${esc(jobLabel(j))}</option>`).join('');if(pane.job)q('[data-code-history]').value=pane.job.job_id;else if(jobs[0]){pane.job=jobs[0];q('[data-code-history]').value=pane.job.job_id;poll()}}catch(e){if(!disposed)show(e.message)}
  };
  const refreshVersions=async()=>{
   const items=await ctx.actions.api('/api/strategy-lab/code-drafts',{signal:ctx.signal});if(disposed)return;versions=items;
   q('[data-code-version]').innerHTML='<option value="">UNSAVED</option>'+versions.map(x=>`<option value="${esc(x.version)}">${esc(x.name)} / ${esc(x.version.slice(0,12))}</option>`).join('');if(pane.savedVersion)q('[data-code-version]').value=pane.savedVersion;
  };
  const read=()=>({source:source.value,manifest:manifest.value});
  const same=value=>source.value===value.source&&manifest.value===value.manifest;
  const requireSame=value=>{if(disposed||!same(value))throw Error('Content changed while preparing. Current edits were kept; validate the new version.')};
  const replace=(s,m)=>{sourceEditor.setText(s);policyEditor.setText(m);pane.source=s;pane.manifest=m;pane.dirty=false;invalidate()};
  const validateContent=async content=>{
   const value=await ctx.actions.operation('/api/strategy-lab/code-validate',content,{signal:ctx.signal});requireSame(content);pane.validation=value;drawDiagnostics();
   show(value.valid?'Static contract checks passed. Review runtime behavior and execution assumptions before running.':`Fix ${value.diagnostics.filter(d=>d.severity==='error').length} error(s) before backtesting.`);return value;
  };
  const saveContent=async content=>{
   const value=await ctx.actions.operation('/api/strategy-lab/code-drafts',content,{signal:ctx.signal});requireSame(content);pane.savedVersion=value.version;pane.dirty=false;show('SAVED / '+value.version);await refreshVersions();requireSame(content);return value;
  };
  async function save(){if(working)return;working=true;controls();try{await saveContent(read())}catch(e){if(!disposed)show(e.message)}finally{working=false;if(!disposed)controls()}}
  const readConditions=()=>{const result={...pane.conditions};for(const input of root.querySelectorAll('[data-code-condition]')){const key=input.dataset.codeCondition;result[key]=input.type==='checkbox'?input.checked:input.type==='number'?(input.value===''?null:Number(input.value)):input.value}return result};
  async function backtest(){
   const shown=readConditions();if(JSON.stringify(shown)!==JSON.stringify(pane.conditions)){pane.conditions=shown;pane.reviewed=false;controls();show('Conditions changed. Review the current inputs again.');return}
   if(working||running()||!pane.reviewed||!catalog?.universe_settings?.default?.revision){if(!disposed)show('Set a default universe in UNIV 0412, then review the exact code and research conditions.');return}
   const content=read(),conditionSnapshot=JSON.stringify(pane.conditions),universeRevision=catalog.universe_settings.default.revision;working=true;controls();
   try{
    const validation=await validateContent(content);if(!validation.valid)return;
    const saved=await saveContent(content);requireSame(content);if(!pane.reviewed||JSON.stringify(pane.conditions)!==conditionSnapshot)throw Error('Research conditions changed. Review the current inputs again.');
    const key=saved.version+':'+universeRevision+':'+conditionSnapshot;if(pane.requestKey!==key||['completed','failed','stopped','cancelled'].includes(pane.job?.status)){pane.requestKey=key;pane.requestId=crypto.randomUUID().replaceAll('-','')}
    const job=await ctx.actions.operation('/api/v1/universes/research',{version:saved.version,expected_version:saved.version,conditions:JSON.parse(conditionSnapshot),expected_universe_revision:universeRevision,request_id:pane.requestId,reviewed:true},{signal:ctx.signal});
    if(disposed)return;pane.job=job;drawJob();show(same(content)?'Historical request accepted; automatic data preparation for version '+saved.version.slice(0,12):'Historical request accepted for the reviewed version; the editor now has newer changes.');poll();refreshHistory();
   }catch(e){if(!disposed)show(e.message+' · Retrying unchanged content retains the submission ID.')}finally{working=false;if(!disposed)controls()}
  }
  const off=[listen(source,'input',()=>{pane.source=source.value;pane.dirty=true;invalidate();show('UNSAVED / Python changed.')}),listen(manifest,'input',()=>{pane.manifest=manifest.value;pane.dirty=true;invalidate();show('UNSAVED / policy changed.')}),listen(q('[data-code-reviewed]'),'change',()=>{pane.reviewed=q('[data-code-reviewed]').checked;controls()}),listen(root,'change',e=>{const input=e.target.closest('[data-code-condition]');if(!input)return;const key=input.dataset.codeCondition;pane.conditions[key]=input.type==='checkbox'?input.checked:input.type==='number'?(input.value===''?null:Number(input.value)):input.value;pane.reviewed=false;controls()}),listen(q('[data-code-history]'),'change',()=>{const job=(pane.jobs||[]).find(j=>j.job_id===q('[data-code-history]').value);if(job){pane.job=job;drawJob();poll()}}),listen(win,'beforeunload',event=>{if(pane.dirty){event.preventDefault();event.returnValue=''}}),listen(root,'click',async event=>{
   const target=event.target.closest('button');if(!target)return;
   if(target.matches('[data-code-universe-open]')){ctx.actions.openScreen('universe-settings');return}
   if(target.matches('[data-code-tab]')){setTab(target.dataset.codeTab);return}
   if(target.matches('[data-code-diagnostic]')){const d=pane.validation.diagnostics[Number(target.dataset.codeDiagnostic)];setTab(d.file==='source'?'source':'manifest');(d.file==='source'?sourceEditor:policyEditor).focus(d.line,d.column);return}
   if(target.matches('[data-code-save]')){save();return}
   if(target.matches('[data-code-run]')){backtest();return}
   if(target.matches('[data-code-results]')){if(pane.job?.run_id)ctx.actions.selectRun(pane.job.run_id);return}
   if(target.matches('[data-code-skeleton]')){if(working)return;const t=strategyTemplates[q('[data-code-template]').value];if(!t)return;if((source.value||manifest.value)&&!win.confirm('Replace the current code and policy with this template?'))return;replace(t.source,managedManifest);pane.savedVersion=null;pane.dirty=true;q('[data-code-version]').value='';show('UNSAVED / '+t.label);return}
   if(target.matches('[data-code-load]')){
    const version=q('[data-code-version]').value;if(!version||working)return;if(pane.dirty&&!win.confirm('Discard unsaved edits and load this version?'))return;
    const before=read();working=true;controls();try{const v=await ctx.actions.api('/api/strategy-lab/code-drafts/'+encodeURIComponent(version),{signal:ctx.signal});requireSame(before);replace(v.source,v.manifest);pane.savedVersion=v.version;show('LOADED / '+v.version)}catch(e){if(!disposed)show(e.message)}finally{working=false;if(!disposed)controls()}return;
   }
   if(target.matches('[data-code-stop]')){if(!running()||working)return;working=true;controls();try{pane.job=await ctx.actions.operation(pane.job.kind==='universe_research'?'/api/v1/universes/research-jobs/'+pane.job.job_id+'/cancel':'/api/paper/jobs/'+pane.job.job_id+'/stop',{}, {signal:ctx.signal});if(!disposed){drawJob();show('Stop requested for historical backtest.');poll()}}catch(e){if(!disposed)show(e.message)}finally{working=false;if(!disposed)controls()}}
  })];
  function drawUniverse(){const u=catalog?.universe_settings,rule=u?.rules?.find(r=>r.id===u.default?.id);q('[data-code-universe-info]').textContent=rule?`${rule.name} / TOP ${rule.top_n} / ${rule.markets.join(' + ')} / REV ${u.default.revision.slice(0,12)} · Symbols and data are resolved by the server.`:'No default universe. Open UNIVERSE SETTINGS (0412), refresh master and save a default rule.'}
  async function loadUniverse(){try{const value=await ctx.actions.api('/api/strategy-lab/catalog',{signal:ctx.signal});if(disposed)return;catalog=value;pane.reviewed=false;drawUniverse();controls()}catch(e){if(!disposed)show(e.message)}finally{if(!disposed)q('[data-code-universe-info]').setAttribute('aria-busy','false')}}
  loadUniverse();
  refreshVersions().catch(e=>{if(!disposed)show(e.message)});refreshHistory();drawDiagnostics();drawJob();setTab(pane.editorTab||'source');if(pane.job)poll();
  return()=>{disposed=true;clearTimeout(timer);off.forEach(f=>f());sourceEditor.dispose();policyEditor.dispose()};
 }
};
