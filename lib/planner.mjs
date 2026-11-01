export const TOPICS = { avengers: 'The Avengers', asgard: 'Asgard', cosmic: 'The cosmic world', division: 'Team tensions', magic: 'The mystical world', wakanda: 'Wakanda' };
export const CONNECTIONS = [
 ['iron-man','avengers'],['thor','avengers'],['first-avenger','avengers'],
 ['first-avenger','winter-soldier'],['avengers','ultron'],['winter-soldier','civil-war'],
 ['ultron','civil-war'],['thor','ragnarok'],['civil-war','black-panther'],
 ['civil-war','infinity-war'],['guardians','infinity-war'],['strange','infinity-war'],
 ['ragnarok','infinity-war'],['black-panther','infinity-war'],['ultron','infinity-war'],
];
export function duration(minutes) { return `${Math.floor(minutes/60)}h${minutes%60 ? ` ${minutes%60}m` : ''}`; }
export function planRoute(movies, hours, watchedIds=[]) {
 if (!Number.isFinite(hours) || hours<0 || hours>30) throw new Error('Choose a time budget from 0 to 30 hours.');
 const valid=new Set(movies.map(m=>m.id));
 if(!Array.isArray(watchedIds)||watchedIds.some(id=>!valid.has(id))) throw new Error('Unknown watched movie.');
 const watched=new Set(watchedIds), destination=movies.find(m=>m.id==='infinity-war');
 const reserved=watched.has(destination.id)?0:destination.runtime;
 const budget=Math.floor(hours*60), allowance=budget-reserved;
 const candidates=movies.filter(m=>m.id!==destination.id&&!watched.has(m.id));
 const seenTopics=new Set(movies.filter(m=>watched.has(m.id)).flatMap(m=>m.topics));
 let best=[], bestScore=-1, bestMinutes=0, examined=0;
 if(allowance>=0) for(let mask=0;mask<(1<<candidates.length);mask++) {
   examined++;
   const chosen=candidates.filter((_,i)=>mask&(1<<i));
   const minutes=chosen.reduce((n,m)=>n+m.runtime,0);
   if(minutes>allowance) continue;
   const topics=new Set(chosen.flatMap(m=>m.topics).filter(t=>!seenTopics.has(t)));
   const available=new Set([...watched,...chosen.map(m=>m.id)]);
   const connections=CONNECTIONS.filter(([a,b])=>available.has(a)&&available.has(b)&&b!==destination.id).length;
   const score=topics.size*20+chosen.reduce((n,m)=>n+m.weight,0)+connections*2;
   if(score>bestScore || (score===bestScore&&minutes<bestMinutes)) { best=chosen;bestScore=score;bestMinutes=minutes; }
 }
 const covered=new Set([...seenTopics,...best.flatMap(m=>m.topics)]);
 const chosenIds=new Set(best.map(m=>m.id));
 const routeIds=new Set(chosenIds);
 if(allowance>=0&&!watched.has(destination.id))routeIds.add(destination.id);
 const missing=Object.keys(TOPICS).filter(t=>!covered.has(t));
 return { selected:best, destination, fits:allowance>=0, destinationWatched:watched.has(destination.id),
  used:allowance>=0?bestMinutes+reserved:0, remaining:allowance>=0?budget-bestMinutes-reserved:budget,
  shortfall:Math.max(0,reserved-budget), missing, covered:[...covered], examined,
  omitted:candidates.filter(m=>!chosenIds.has(m.id)),
  gaps:CONNECTIONS.filter(([a,b])=>routeIds.has(b)&&!watched.has(a)&&!routeIds.has(a)),
  score:Math.max(0,bestScore), budget };
}
