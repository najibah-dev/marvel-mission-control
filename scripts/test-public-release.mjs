import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POST} from '../app/api/explain/route.ts';
const originalFetch=globalThis.fetch;
let calls=0;
globalThis.fetch=async()=>{calls++;throw new Error('Public endpoint must not call a provider');};
try{
 for(let n=0;n<3;n++){
  const response=await POST();assert.equal(response.status,410);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert((await response.json()).error.includes('dashboard'));
 }
 assert.equal(calls,0);
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert(page.includes('WHY THIS FILM?'));assert(page.includes('{film.why}'));
 assert(!page.includes("fetch('/api/explain'"));assert(!page.includes('Explain my recommendation'));
 const route=readFileSync(new URL('../app/api/explain/route.ts',import.meta.url),'utf8');
 assert(!route.includes('GROQ_API_KEY'));assert(!route.includes('createExplanationHandler'));
 console.log('PASS: public recommendation notes visible; retired endpoint returns 410 with zero provider calls and no credential access.');
}finally{globalThis.fetch=originalFetch;}
