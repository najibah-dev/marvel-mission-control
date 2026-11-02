import assert from 'node:assert/strict';
import movies from '../lib/catalog.json' with {type:'json'};
import {planRoute} from '../lib/planner.mjs';
import {topicBreakdown,nextRecommendation} from '../lib/dashboard.mjs';
import {setMovieWatched} from '../lib/preferences.mjs';
import {timeUntilRelease,scheduleRoute,restoreJourney} from '../lib/timeline.mjs';
let cases=0;
for(const history of [[],['avengers'],['infinity-war'],movies.map(m=>m.id)])for(const pace of [0,.5,1,2,4,10,20]){
 const t=timeUntilRelease('2026-11-02','2026-12-18',pace),p=planRoute(movies,t.availableMinutes/60,history);
 const topics=topicBreakdown(movies,p,history);
 for(const row of topics){assert.equal(row.watched+row.planned+row.omitted,row.total);assert(row.omitted>=0);}
 assert.equal(topics.filter(t=>t.watched+t.planned>0).length,p.covered.length);
 const schedule=scheduleRoute(p.selected,'2026-11-02',pace);
 assert.equal(schedule.length,p.selected.length);
 assert(schedule.every(row=>row.finishBy>='2026-11-02'&&row.finishBy<'2026-12-18'));
 assert(p.used<=t.availableMinutes);cases++;
}
assert.equal(timeUntilRelease('2026-11-02','2026-12-18',2).availableMinutes,788);
assert.equal(timeUntilRelease('2026-11-02','2026-12-18',2).days,46);
assert.equal(timeUntilRelease('2026-12-18','2026-12-18',2).availableMinutes,0);
assert.equal(timeUntilRelease('2026-12-19','2026-12-18',2).ended,true);
assert.equal(timeUntilRelease('2028-02-28','2028-03-01',7).days,2);
assert.equal(timeUntilRelease('2026-11-01','2026-11-02',7).days,1); // DST boundary uses dates, not elapsed local hours.
for(const date of ['','2026-02-30','not a date'])assert.throws(()=>timeUntilRelease('2026-11-02',date,2));
for(const pace of [-1,21,NaN,Infinity])assert.throws(()=>timeUntilRelease('2026-11-02','2026-12-18',pace));
const first=nextRecommendation(movies,788/60,[]);
const watched=setMovieWatched(setMovieWatched([],first.id,true),first.id,true);
assert.deepEqual(watched,[first.id]);assert.notEqual(nextRecommendation(movies,788/60,watched)?.id,first.id);
assert.equal(nextRecommendation(movies,60,movies.map(m=>m.id)),null);
assert.deepEqual(setMovieWatched(setMovieWatched(watched,first.id,false),first.id,false),[]);
const saved=restoreJourney(null,JSON.stringify({hours:12,watched:['avengers','bad','avengers']}),movies);
assert.deepEqual(saved,{weeklyHours:2,targetDate:'2026-12-18',watched:['avengers']});
assert.equal(restoreJourney(JSON.stringify({weeklyHours:4,targetDate:'2026-12-16'}),null,movies).targetDate,'2026-12-16');
assert.equal(restoreJourney(JSON.stringify({weeklyHours:99,targetDate:'bad'}),null,movies).weeklyHours,2);
assert.throws(()=>restoreJourney('{bad',null,movies));
console.log(`PASS: ${cases} timeline/dashboard cases, deadline and DST/leap boundaries, saved-progress migration, recommendation advance and repeated checkbox state.`);

const defaultPlan=planRoute(movies,788/60,[]);
assert(defaultPlan.selected.some(m=>m.id==='endgame'));
assert(defaultPlan.selected.some(m=>m.id==='infinity-war'));
assert(!defaultPlan.selected.some(m=>m.priority==='optional'));
console.log('PASS: default two-hour weekly route prioritizes Endgame with its setup over optional origins');
