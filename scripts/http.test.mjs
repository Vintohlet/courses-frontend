import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import { test } from 'node:test'
const source = fs.readFileSync(new URL('../src/api/client.ts', import.meta.url), 'utf8').replace('import.meta.env.VITE_API_URL', 'undefined')
const compiled = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
let id=0
async function client() { return import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+id++).toString('base64')) }
const response=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}})
test('optional endpoints discard invalid token and retry once anonymously', async()=>{
 for(const path of ['/courses','/courses/652000010000000000000008','/courses/recommendations']) {
  const api=await client();api.tokenStorage.set('expired');const calls=[];let resets=0
  api.onUnauthorized(required=>{assert.equal(required,false);resets++})
  globalThis.fetch=async(url,options)=>{calls.push(options.headers);return calls.length===1?response(401,{message:'Expired'}):response(200,{ok:true})}
  assert.deepEqual(await api.http(path,{auth:'optional'}),{ok:true});assert.equal(calls.length,2);assert.equal(calls[0].Authorization,'Bearer expired');assert.equal(calls[1].Authorization,undefined);assert.equal(resets,1);assert.equal(api.tokenStorage.get(),'')
 }
})
test('a second optional 401 never causes a third request',async()=>{const api=await client();api.tokenStorage.set('bad');let calls=0;globalThis.fetch=async()=>{calls++;return response(401,{message:'Unauthorized'})};await assert.rejects(api.http('/courses',{auth:'optional'}),{status:401});assert.equal(calls,2)})
test('protected 401 logs out and requests redirect without retry',async()=>{const api=await client();api.tokenStorage.set('expired');let calls=0,redirect=false;api.onUnauthorized(required=>{redirect=required});globalThis.fetch=async()=>{calls++;return response(401,{message:'Sign in again'})};await assert.rejects(api.http('/users/me',{auth:'required'}),{status:401,message:'Sign in again'});assert.equal(calls,1);assert.equal(redirect,true);assert.equal(api.tokenStorage.get(),'')})
test('validation message arrays are joined and disabled storage is supported',async()=>{globalThis.localStorage={getItem(){throw Error('Disabled')},setItem(){throw Error('Disabled')},removeItem(){throw Error('Disabled')}};const api=await client();api.tokenStorage.set('memory');assert.equal(api.tokenStorage.get(),'memory');globalThis.fetch=async()=>response(422,{message:['Unknown interest','Invalid name']});await assert.rejects(api.http('/auth/register',{auth:'none'}),{message:'Unknown interest. Invalid name'});api.tokenStorage.set('');delete globalThis.localStorage})
test('cancellation is preserved instead of being reported as a network error',async()=>{const api=await client();globalThis.fetch=async()=>{throw new DOMException('Aborted','AbortError')};await assert.rejects(api.http('/courses'),{name:'AbortError'})})
