import {operatingAccountShell,mountOperatingAccount} from '../views/operating-account.js';
export default {id:'account',number:'0110',command:'ACC',desk:'strategy',defaultSlot:0,title:'Operating Portfolio',render:()=>operatingAccountShell(),mount:(root,ctx,pane)=>mountOperatingAccount(root,ctx,pane)};
