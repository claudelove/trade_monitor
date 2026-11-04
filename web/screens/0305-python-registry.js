import {esc,listen} from '../ui/dom.js';
export default {id:'python-registry',number:'0305',command:'PYTHON',aliases:['SOURCE'],desk:'backtest',title:'Reviewed Python Strategy Entry',defaultSlot:4,
 render(){return `<div class="function-actions"><b>REVIEWED LOCAL PYTHON</b><span>NO ARBITRARY UPLOAD / TRUSTED CODE, NOT A SANDBOX</span></div><div class="runbook">1. Put the LLM-authored source in <b>strategies/python/YOUR_STRATEGY.py</b>.<br>2. Review the code against <b>docs/strategies/CONTRACT.md</b> (bar API v1).<br>3. Add its file, reviewed byte SHA256 and manifest to <b>strategies/registry.toml</b>.<br>4. Reload this catalog, inspect the exact source and settings below, then run a historical test.</div><div class="management-form"><label>REGISTERED SOURCE<select data-py-source aria-label="Registered Python source"></select></label><label>DATASET<select data-py-dataset aria-label="Python research dataset"></select></label><button data-py-load>RELOAD CATALOG</button></div><div data-py-status role="status"></div><label class="review-check"><input type="checkbox" data-py-reviewed>I reviewed this exact local Python source, its manifest, dependencies and hashes.</label><button data-py-run class="run-research">RUN REGISTERED HISTORICAL TEST</button><div data-py-job role="status"></div><div class="lab-layout python-source-layout"><section><div class="section-bar">EXACT REVIEWED SOURCE</div><pre class="raw-evidence" data-py-code></pre></section><section><div class="section-bar">MANIFEST / EXECUTION / RISK</div><pre class="raw-evidence" data-py-manifest></pre><p data-py-hashes class="section-note"></p></section></div><p class="section-note">Only pre-registered files under strategies/python are eligible. A Python plugin can access the local filesystem: this is trusted code, not an upload sandbox. Event-1 paper planning uses its separate contract and CLI; this screen runs bar API v1. Live deployment remains a separate acceptance process.</p>`},
 mount(root,ctx,pane){
  let disposed=false,timer=null,items=[];
  const q=s=>root.querySelector(s),show=text=>{q('[data-py-status]').textContent=text};
  const selected=()=>items.find(x=>x.id===q('[data-py-source]').value);
  const busy=()=>pane.submitting||pane.job?.status==='running';
  const controls=()=>{q('[data-py-source]').disabled=busy();q('[data-py-dataset]').disabled=busy();q('[data-py-load]').disabled=busy();q('[data-py-run]').disabled=busy()||!selected()||!pane.reviewed;};
  const draw=()=>{const item=selected(),identity=item?item.id+':'+item.sha256+':'+item.manifest_sha256:null;
   if(identity!==pane.sourceIdentity){pane.reviewed=false;pane.requestId=null;pane.job=null;pane.sourceIdentity=identity;}
   pane.source=item?.id;pane.dataset=q('[data-py-dataset]').value;
   q('[data-py-code]').textContent=item?.source||'No approved local source available.';q('[data-py-manifest]').textContent=item?item.manifest+'\n# EFFECTIVE ENGINE SETTINGS (including defaults)\n'+JSON.stringify(item.effective_settings||{},null,2):'';
   q('[data-py-hashes]').textContent=item?`SOURCE SHA256 ${item.sha256}\nMANIFEST SHA256 ${item.manifest_sha256}`:'';
   q('[data-py-reviewed]').checked=!!pane.reviewed;controls();
  };
  const poll=async()=>{if(disposed||!pane.job)return;try{
   const value=await ctx.actions.api('/api/paper/jobs/'+pane.job.job_id,{signal:ctx.signal});if(disposed)return;pane.job=value;
   const box=q('[data-py-job]');box.textContent=`JOB ${pane.job.job_id} / ${pane.job.status}`;
   if(pane.job.run_id){const button=root.ownerDocument.createElement('button');button.textContent='OPEN RESEARCH RESULT';button.onclick=()=>ctx.actions.selectRun(pane.job.run_id);box.append(button)}else if(pane.job.status==='running')timer=setTimeout(poll,1000);controls();
  }catch(error){if(!disposed)show(error.message)}};
  const load=async()=>{try{
   const value=await ctx.actions.api('/api/strategy-lab/catalog',{signal:ctx.signal});if(disposed)return;items=value.registered_python||[];
   q('[data-py-source]').innerHTML=items.map(i=>`<option value="${i.id}">${esc(i.title)}</option>`).join('');
   q('[data-py-dataset]').innerHTML=value.datasets.map(d=>`<option value="${d.id}">${esc(d.id)}${d.synthetic?' / SYNTHETIC':''}</option>`).join('');
   if(pane.source)q('[data-py-source]').value=pane.source;if(pane.dataset)q('[data-py-dataset]').value=pane.dataset;
   show(value.registry_error||'Review the exact registered file before execution.');draw();if(pane.job)poll();
  }catch(error){if(!disposed)show(error.message)}};
  const off=[listen(q('[data-py-source]'),'change',draw),listen(q('[data-py-dataset]'),'change',()=>{pane.dataset=q('[data-py-dataset]').value;pane.requestId=null;pane.reviewed=false;q('[data-py-reviewed]').checked=false;controls()}),listen(q('[data-py-reviewed]'),'change',()=>{pane.reviewed=q('[data-py-reviewed]').checked;controls()}),listen(q('[data-py-load]'),'click',load),listen(q('[data-py-run]'),'click',async()=>{
   const item=selected();if(busy())return;if(!item||!pane.reviewed){show('Review the exact source and check the confirmation.');return}
   pane.submitting=true;controls();try{
    if(['completed','failed','stopped'].includes(pane.job?.status))pane.requestId=null;
    pane.requestId??=crypto.randomUUID().replaceAll('-','');
    pane.job=await ctx.actions.operation('/api/strategy-lab/run-python',{strategy_id:item.id,dataset:pane.dataset,expected_sha256:item.sha256,manifest_sha256:item.manifest_sha256,request_id:pane.requestId});if(!disposed)poll();
   }catch(error){if(!disposed)show(error.message)}finally{pane.submitting=false;if(!disposed)controls()}
  })];load();return ()=>{disposed=true;clearTimeout(timer);off.forEach(f=>f())}
 }
};
