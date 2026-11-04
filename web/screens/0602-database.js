import {esc,listen} from '../ui/dom.js';
export default {id:'database',number:'0602',command:'DATABASE',aliases:['DB'],desk:'admin',title:'Database Operations',defaultSlot:1,
 render(){return `<div class="function-actions"><b>DATABASE / ARCHIVE OPERATIONS</b><button data-db-inspect>INSPECT SCHEMA</button></div><div data-db-status role="status">Read-only inspection. No remote migration runs from the browser.</div><pre class="raw-evidence" data-db-report></pre><div class="section-bar">OPERATOR RUNBOOK</div><pre class="runbook">krx db-prepare                       # print schema/partition plan
krx db-prepare --apply               # explicit operator migration
krx db-inspect                      # tables / indexes / UTC partitions
krx db-backup --destination artifacts/backups/UNIQUE_RUN
krx db-verify-backup --manifest artifacts/backups/UNIQUE_RUN/manifest.json
krx lake-export --root artifacts/lake
krx lake-verify --manifest artifacts/lake/manifest-....json</pre><p class="section-note">Market events can use PostgreSQL / Cloud SQL or MongoDB. Research, OMS and access state currently use local SQLite on persistent storage. Stop writers for a coordinated cross-database backup. Canonical raw events have no automatic TTL. Supplying credentials does not certify capacity, restoration or live trading.</p>`},
 mount(root,ctx){let busy=false;const query=async()=>{if(busy)return;busy=true;try{const value=await ctx.actions.api('/api/database/status',{signal:ctx.signal});if(ctx.signal.aborted)return;root.querySelector('[data-db-report]').textContent=JSON.stringify(value,null,2);root.querySelector('[data-db-status]').textContent=value.ready?'CANONICAL STORAGE CHECK PASSED · Live trading remains uncertified':'STORAGE PREPARATION REQUIRED · Check missing schema/index/partition items below'}catch(error){if(!ctx.signal.aborted)root.querySelector('[data-db-status]').textContent=error.message}finally{busy=false}};const off=listen(root.querySelector('[data-db-inspect]'),'click',query);query();return off}
};
