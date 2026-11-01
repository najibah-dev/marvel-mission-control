import assert from 'node:assert/strict';
import movies from '../lib/catalog.json' with {type:'json'};
import {prepareExplanation, validateExplanation} from '../lib/explain.ts';
import {createExplanationHandler} from '../lib/explanation-service.ts';
import {restorePreferences} from '../lib/preferences.mjs';

const input={movieId:'avengers',hours:12,watched:[]};
const body={text:'The Avengers brings the core heroes together and connects Earth with a larger world.',sourceIds:['avengers']};
const request=(data=input,origin='http://localhost')=>new Request('http://localhost/api/explain',{
  method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)
});
let cases=0;
async function check(name,fn){await fn();cases++;console.log('PASS:',name);}

await check('selection status is computed from the plan',()=>{
  assert.equal(prepareExplanation(input).context.status,'included');
  assert.equal(prepareExplanation({...input,movieId:'iron-man'}).context.status,'outside budget');
  assert.equal(prepareExplanation({...input,watched:['avengers']}).context.status,'already watched');
});
await check('invalid inputs rejected before provider call',async()=>{
  const handler=createExplanationHandler(()=> 'test',async()=>{throw new Error('Provider must not be called');});
  for(const data of [null,{}, {...input,movieId:'unknown'}, {...input,hours:-1}, {...input,watched:['avengers','avengers']}, {...input,watched:['unknown']}]){
    assert.equal((await handler(request(data))).status,400);
  }
});
await check('foreign origins and oversized requests rejected',async()=>{
  const handler=createExplanationHandler(()=>undefined);
  assert.equal((await handler(request(input,'https://other.example'))).status,403);
  assert.equal((await handler(request({extra:'x'.repeat(3001)}))).status,413);
});
await check('missing key returns editorial fallback and correct status',async()=>{
  const result=await (await createExplanationHandler(()=>undefined)(request())).json();
  assert.equal(result.mode,'curated');assert(result.text.startsWith('This movie is included'));
});
await check('malformed output and unsupported references rejected',()=>{
  for(const value of [null,[],{}, {...body,text:'short'}, {...body,sourceIds:['unknown']}, {...body,sourceIds:[]}, {...body,extra:true}, {...body,text:'word '.repeat(91)}]){
    assert.throws(()=>validateExplanation(JSON.stringify(value),['avengers'],'avengers'));
  }
  assert.throws(()=>validateExplanation('not JSON',['avengers'],'avengers'));
  assert.deepEqual(validateExplanation(JSON.stringify(body),['avengers'],'avengers'),body);
});
await check('provider errors, timeout, empty choices, and invalid JSON fall back',async()=>{
  const providers=[
    async()=>new Response('',{status:429}),
    async()=>new Response('',{status:503}),
    async()=>{throw new DOMException('Simulated timeout','TimeoutError');},
    async()=>Response.json({choices:[]}),
    async()=>Response.json({choices:[{message:{content:'bad JSON'}}]})
  ];
  for(const provider of providers){
    const result=await (await createExplanationHandler(()=> 'test',provider)(request())).json();
    assert.equal(result.mode,'curated');assert(result.reason);assert(result.text.includes(movies.find(m=>m.id==='avengers').why));
  }
});
await check('successful responses expose real usage and cache avoids another call',async()=>{
  let calls=0;
  const provider=async(url,options)=>{
    calls++;const payload=JSON.parse(options.body);
    assert(options.signal instanceof AbortSignal);
    assert.equal(payload.response_format.type,'json_schema');
    assert.equal(payload.max_completion_tokens,1024);
    return Response.json({choices:[{message:{content:JSON.stringify(body)}}],usage:{prompt_tokens:500,completion_tokens:40}});
  };
  const handler=createExplanationHandler(()=> 'test',provider);
  const first=await (await handler(request())).json();
  const second=await (await handler(request())).json();
  assert.equal(first.mode,'ai');assert.equal(first.inputTokens,500);assert.equal(first.outputTokens,40);
  assert.equal(first.cached,false);assert.equal(second.cached,true);assert.equal(calls,1);
});
await check('per-isolate request limit is enforced',async()=>{
  const handler=createExplanationHandler(()=>undefined);
  for(let n=0;n<12;n++)assert.equal((await handler(request())).status,200);
  assert.equal((await handler(request())).status,429);
});
await check('saved preferences remove duplicates and invalid IDs, normalize budget',()=>{
  assert.deepEqual(restorePreferences(JSON.stringify({hours:12.26,watched:['avengers','avengers','bad',1]}),movies),{hours:12.5,watched:['avengers']});
  assert.deepEqual(restorePreferences('null',movies),{hours:12,watched:[]});
  assert.deepEqual(restorePreferences(JSON.stringify({hours:40,watched:'bad'}),movies),{hours:12,watched:[]});
  assert.throws(()=>restorePreferences('{broken',movies)); // UI catches and keeps defaults.
});
console.log(`PASS: ${cases} explanation and persistence test groups. Provider behavior is simulated; these do not measure factual accuracy.`);
