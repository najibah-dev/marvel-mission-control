import assert from 'node:assert/strict';
import movies from '../lib/catalog.json' with {type:'json'};
import {planRoute,CONNECTIONS,priorityScore} from '../lib/planner.mjs';
let scenarios=0;
const histories=[[],['iron-man'],['avengers','guardians'],['infinity-war'],['endgame'],movies.map(m=>m.id)];
for(const watched of histories)for(let hours=0;hours<=60;hours+=.5){
 const p=planRoute(movies,hours,watched);scenarios++;
 assert(p.used<=Math.floor(hours*60));assert.equal(p.used,p.selected.reduce((n,m)=>n+m.runtime,0));
 assert(p.selected.every(m=>!watched.includes(m.id)));assert.equal(new Set(p.selected.map(m=>m.id)).size,p.selected.length);
 assert.deepEqual(p.selected.map(m=>m.release),p.selected.map(m=>m.release).sort());
 if(p.selected.some(m=>m.id==='endgame'))assert(watched.includes('infinity-war')||p.selected.some(m=>m.id==='infinity-war'));
 assert(!p.selected.some(m=>m.id==='doomsday'));
}
assert.equal(planRoute(movies,60,[]).selected.length,movies.length);
assert.equal(planRoute(movies,60,[]).gaps.length,0);
assert.equal(planRoute(movies,0,[]).used,0);
assert.equal(planRoute(movies,60,movies.map(m=>m.id)).used,0);
const shortest=Math.min(...movies.map(m=>m.runtime));
assert.equal(planRoute(movies,(shortest-1)/60,[]).selected.length,0);
assert.equal(planRoute(movies,shortest/60,[]).used,shortest);
for(const invalid of [-1,NaN,Infinity,100001])assert.throws(()=>planRoute(movies,invalid,[]));
assert.throws(()=>planRoute(movies,8,['unknown']));
assert.equal(new Set(movies.map(m=>m.id)).size,20);
for(const [a,b] of CONNECTIONS)assert(movies.find(m=>m.id===a).release<movies.find(m=>m.id===b).release);
assert(movies.every(m=>m.runtime>0&&Number.isInteger(m.runtime)));
// Compare DP against exhaustive enumeration on a small independent fixture.
const sample=movies.filter(m=>['iron-man','avengers','infinity-war','endgame','thunderbolts','fantastic-four'].includes(m.id));
for(const budget of [115,126,240,330,500,720]){
 let maximum=0;
 for(let mask=0;mask<(1<<sample.length);mask++){
  const subset=sample.filter((_,i)=>mask&(1<<i));
  if(subset.some(m=>m.id==='endgame')&&!subset.some(m=>m.id==='infinity-war'))continue;
  if(subset.reduce((n,m)=>n+m.runtime,0)>budget)continue;
  maximum=Math.max(maximum,subset.reduce((n,m)=>n+priorityScore(m),0));
 }
 assert.equal(planRoute(sample,budget/60,[]).score,maximum);
}
console.log(`PASS: ${scenarios} budget/history cases, priority optimum versus exhaustive fixtures, Infinity War/Endgame constraint, boundaries and catalog.`);
