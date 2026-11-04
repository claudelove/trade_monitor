export default {id:'market-home',number:'0002',command:'MKT',desk:'market',kind:'workspace',title:'Market Monitor',subtitle:'Security charts, source news and disclosures.',nav:true,shortcut:2,navLabel:'Market',render:()=>'<div data-workspace-host></div>',mount:(root,ctx)=>ctx.actions.mountWorkspace(root.querySelector('[data-workspace-host]'))};

