export default {id:'backtest-home',number:'0003',command:'BT',desk:'backtest',kind:'workspace',title:'Strategy & Research',subtitle:'Enter, validate, review and test a strategy.',nav:true,navOrder:3,navLabel:'Strategy',render:()=>'<div data-workspace-host></div>',mount:(root,ctx)=>ctx.actions.mountWorkspace(root.querySelector('[data-workspace-host]'))};

