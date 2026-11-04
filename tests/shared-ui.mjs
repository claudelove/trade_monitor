import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {apiVersion,version,bindWindowChrome,setTheme,readTypography,watchTypography,mountScope,listen} from '../web/shared/index.js';
const lock=JSON.parse(readFileSync('terminal-ui.lock.json'));assert.equal(apiVersion,lock.api_version);assert.equal(version,lock.version);
const dom=new JSDOM('<main></main>',{url:'https://example.invalid/'}),doc=dom.window.document,root=doc.querySelector('main');let focus=0,max=0,actions=[];
// No registry, portfolio, API or screen-number dependency.
for(const screenNumber of ['0101','9876']){
 root.innerHTML=`<section class="tool-window" data-function="${screenNumber}"><div class="window-titlebar" tabindex="0"><select><option>Local function</option></select><button data-window-action="maximize">Max</button><button data-window-action="close">Close</button></div><div class="window-body"></div></section>`;
 const pane=root.firstElementChild,off=bindWindowChrome(pane,{onFocus:()=>focus++,onAction:action=>actions.push(action),onToggleMaximize:()=>max++});
 pane.dispatchEvent(new dom.window.Event('pointerdown',{bubbles:true}));pane.querySelector('[data-window-action=maximize]').click();pane.querySelector('[data-window-action=close]').click();
 pane.querySelector('.window-titlebar').dispatchEvent(new dom.window.MouseEvent('dblclick',{bubbles:true}));pane.querySelector('.window-titlebar').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
 off();off();pane.querySelector('[data-window-action=close]').click();
}
assert.equal(focus,2);assert.deepEqual(actions,['maximize','close','maximize','close']);assert.equal(max,4);
setTheme(root,{fontFamily:'Verdana, sans-serif',typeScale:1.2,letterSpacing:.3,wordSpacing:.5,lineHeight:1.4,chartFontSize:12,text:'#dedede'});
const type=readTypography(root);assert.ok(Math.abs(type.fontSize-14.4)<1e-9);assert.equal(type.fontFamily,'Verdana, sans-serif');assert.equal(type.textColor,'#dedede');
const before=root.getAttribute('style');assert.throws(()=>setTheme(root,{typeScale:1.1,chartFontSize:NaN}));assert.equal(root.getAttribute('style'),before,'theme updates validate atomically');assert.throws(()=>setTheme(root,{unknown:1}));
let changes=0;const stop=watchTypography(root,()=>changes++);setTheme(root,{chartFontSize:14});await new Promise(r=>setImmediate(r));assert.ok(changes>=1);stop();const count=changes;setTheme(root,{chartFontSize:15});await new Promise(r=>setImmediate(r));assert.equal(changes,count,'disposed observers/listeners must not remain');
const scope=mountScope(root);let clicks=0;listen(root,'click',()=>clicks++);root.click();scope.abort();root.click();assert.equal(clicks,1);
const tokens=readFileSync('packages/terminal-ui/src/ui/tokens.css','utf8');assert.match(tokens,/--ui-letter-spacing/);assert.match(tokens,/--ui-type-scale/);dom.window.close();
console.log('Shared UI contract passed: arbitrary screen numbers, window input/keyboard/disposal, atomic typography, CSS tokens and chart theme observer cleanup.');
