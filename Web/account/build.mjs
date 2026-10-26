import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {homedir} from 'node:os';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../..');
const candidates=[process.env.SPACETRADER_NODE_MODULES,join(directory,'node_modules'),join(homedir(),'.codex/.chatgpt-projects/g-p-6a6cafad42f48191ac7d11c61811b6e5/roles/node_modules')].filter(Boolean);
const dependencies=candidates.find(path=>existsSync(join(path,'esbuild/package.json')));
if(!dependencies)throw Error('Install the pinned account dependencies or provide an existing compatible SPACETRADER_NODE_MODULES. No installation was started.');
const require=createRequire(join(dependencies,'spacetrader-build.cjs'));
const packageJSON=JSON.parse(await readFile(join(directory,'package.json')));
for(const [name,version] of Object.entries({...packageJSON.dependencies,...packageJSON.devDependencies})){
 const actual=JSON.parse(await readFile(join(dependencies,name,'package.json'))).version;if(actual!==version)throw Error(`Account build needs ${name} ${version}; found ${actual}.`);
}
const source=JSON.parse(await readFile(join(directory,'shared/provenance.json')));
for(const [file,hash] of Object.entries(source.files))if(createHash('sha256').update(await readFile(join(directory,'shared',file))).digest('hex')!==hash)throw Error('Canonical shared sign-in source changed: '+file);
const {build}=require('esbuild');
const common={bundle:true,logLevel:'warning',logLimit:4,nodePaths:[dependencies],legalComments:'eof'};
if(process.argv.includes('--test')||process.argv.includes('--ui-test')||process.argv.includes('--compact-test')||process.argv.includes('--efficient-test')||process.argv.includes('--boundary-test')){
 const ui=process.argv.includes('--ui-test'),name=process.argv.includes('--boundary-test')?'storage-boundaries':process.argv.includes('--efficient-test')?'efficient-saves':ui?'account-ui':process.argv.includes('--compact-test')?'compact-saves':'account-saves';
 const output=join(root,'Research/AccountSaves-2026-10-26',name+'.cjs');await mkdir(dirname(output),{recursive:true});
 await build({...common,platform:'node',target:'node24',format:'cjs',external:['@electric-sql/pglite','playwright-core'],entryPoints:[join(root,'Tests/browser',name+'.test.mjs')],outfile:output});
 const test=spawnSync(process.execPath,[output],{stdio:'inherit',cwd:root,env:{...process.env,NODE_PATH:dependencies}});if(test.error)throw test.error;process.exitCode=test.status??1;
}else{
 const output=join(root,'Web/.vercel/output'),fn=join(output,'functions/api/index.func');
 await mkdir(fn,{recursive:true});
 await build({...common,platform:'browser',target:'es2022',format:'iife',minify:true,entryPoints:[join(directory,'client.jsx')],outfile:join(output,'static/play/account-client.js')});
 await build({...common,platform:'node',target:'node24',format:'cjs',entryPoints:[join(directory,'api.mjs')],outfile:join(fn,'index.cjs')});
 await writeFile(join(fn,'.vc-config.json'),JSON.stringify({runtime:'nodejs24.x',handler:'index.cjs',launcherType:'Nodejs',shouldAddHelpers:true,maxDuration:60})+'\n');
 console.log('Built canonical themed login and isolated account-save function with existing pinned dependencies.');
}
