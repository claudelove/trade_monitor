export default {id:'overview',number:'0001',command:'OV',desk:'strategy',kind:'workspace',title:'Portfolio Monitor',subtitle:'Account NAV, PnL, risk and sleeve contribution.',nav:true,shortcut:1,navLabel:'Portfolio',render:()=>'<div data-workspace-host></div>',mount:(root,ctx)=>ctx.actions.mountWorkspace(root.querySelector('[data-workspace-host]'))};

