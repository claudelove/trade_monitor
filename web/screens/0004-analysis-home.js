export default {id:'analysis-home',number:'0004',command:'ANALYSIS',desk:'analysis',kind:'workspace',title:'Analytics & Data',subtitle:'Statistical validation, provenance, order books and source data.',nav:true,navOrder:4,navLabel:'Analytics & Data',render:()=>'<div data-workspace-host></div>',mount:(root,ctx)=>ctx.actions.mountWorkspace(root.querySelector('[data-workspace-host]'))};

