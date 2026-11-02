import assert from 'node:assert/strict';
import movies from '../lib/catalog.json' with {type:'json'};
import {planRoute} from '../lib/planner.mjs';
import {topicBreakdown,budgetScenarios} from '../lib/dashboard.mjs';

let cases=0;
for(const watched of [[],['avengers'],['infinity-war'],movies.map(m=>m.id)]){
  for(const hours of [0,2,2.5,8,12,20,30]){
    const plan=planRoute(movies,hours,watched);
    const topics=topicBreakdown(movies,plan,watched);
    assert.equal(topics.length,6);
    for(const row of topics){
      assert.equal(row.watched+row.planned+row.omitted,row.total);
      assert(row.omitted>=0);
      assert.equal(row.watched,movies.filter(m=>watched.includes(m.id)&&m.topics.includes(row.id)).length);
    }
    assert.equal(topics.filter(t=>t.watched+t.planned>0).length,plan.covered.length);
    cases++;
  }
  for(const s of budgetScenarios(movies,watched)){
    const plan=planRoute(movies,s.hours,watched);
    assert.equal(s.minutes,plan.used);
    assert.equal(s.films,plan.selected.length+Number(plan.fits&&!plan.destinationWatched));
    assert(s.minutes<=s.hours*60);
  }
}
const twelve=budgetScenarios(movies,[]).find(s=>s.hours===12);
assert.deepEqual(twelve,{hours:12,minutes:694,films:5,topics:5,gaps:8});
const magic=topicBreakdown(movies,planRoute(movies,12,[]),[]).find(t=>t.id==='magic');
assert.equal(magic.planned,0);assert.equal(magic.omitted,1);
assert(budgetScenarios(movies,movies.map(m=>m.id)).every(s=>s.minutes===0&&s.films===0));
console.log(`PASS: ${cases} dashboard metric cases, scenario consistency, 12-hour baseline, and all-watched boundaries.`);
