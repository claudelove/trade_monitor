export default {id:'backtest-home',number:'0003',command:'BT',desk:'backtest',kind:'workspace',title:'Strategy & Backtests',subtitle:'Write strategy code and review backtest results.',nav:true,navOrder:3,navLabel:'Research',render:()=>'<div data-workspace-host></div>',mount:(root,ctx)=>ctx.actions.mountWorkspace(root.querySelector('[data-workspace-host]'))};

