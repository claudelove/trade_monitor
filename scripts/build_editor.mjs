import {build} from 'esbuild';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
await build({entryPoints:['packages/terminal-ui/editor/editor.js'],bundle:true,format:'esm',minify:true,target:'es2022',outfile:'packages/terminal-ui/src/ui/code-editor.js',legalComments:'inline'});
const lock=JSON.parse(readFileSync('package-lock.json')),notices=[];
for(const path of Object.keys(lock.packages).sort())if(/^node_modules\/(?:@codemirror\/|@lezer\/|@marijn\/|codemirror$|crelt$|style-mod$|w3c-keyname$)/.test(path)){
 const metadata=JSON.parse(readFileSync(path+'/package.json'));const files=['LICENSE','LICENSE.md','LICENSE.txt'];let license;for(const f of files){try{license=readFileSync(path+'/'+f,'utf8');break}catch{}}
 if(!license)throw Error('Missing editor license: '+path);notices.push(metadata.name+' '+metadata.version+'\n'+license);
}
mkdirSync('packages/terminal-ui/licenses/codemirror',{recursive:true});writeFileSync('packages/terminal-ui/licenses/codemirror/LICENSE',notices.join('\n\n'));
console.log('Bundled offline CodeMirror editor and dependency licenses.');
