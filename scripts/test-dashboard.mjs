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

// Regression: repeated checked events must not undo watched progress.
const {setMovieWatched,restorePreferences}=await import('../lib/preferences.mjs');
let progress=setMovieWatched([],'avengers',true);
progress=setMovieWatched(progress,'avengers',true);
assert.deepEqual(progress,['avengers']);
assert(!planRoute(movies,12,progress).selected.some(m=>m.id==='avengers'));
assert.deepEqual(restorePreferences(JSON.stringify({hours:12,watched:progress}),movies).watched,progress);
progress=setMovieWatched(progress,'avengers',false);
progress=setMovieWatched(progress,'avengers',false);
assert.deepEqual(progress,[]);
assert(planRoute(movies,12,progress).selected.some(m=>m.id==='avengers'));
console.log('PASS: repeated check/uncheck, route exclusion/restoration, saved progress round-trip');

const {nextRecommendation}=await import('../lib/dashboard.mjs');
assert.equal(nextRecommendation(movies,12,[]).id,'avengers');
const afterWatching=nextRecommendation(movies,12,['avengers']);
assert(afterWatching && afterWatching.id!=='avengers');
assert.equal(afterWatching.id,planRoute(movies,12,['avengers']).selected[0].id);
assert.equal(nextRecommendation(movies,2.5,[]).id,'infinity-war');
assert.equal(nextRecommendation(movies,0,[]),null);
assert.equal(nextRecommendation(movies,30,movies.map(m=>m.id)),null);
console.log(`PASS: next recommendation advances Avengers -> ${afterWatching.title}; destination-only and empty-plan boundaries`);
