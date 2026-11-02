export const TOPICS = { avengers:'Avengers legacy', fantastic:'Fantastic Four', mutants:'X-Men', multiverse:'Multiverse', wakanda:'Wakanda & Talokan', newguard:'New teams' };
export const PRIORITIES={high:'High priority',useful:'Useful context',optional:'Optional origins'};
export const DESTINATION={id:'doomsday',title:'Avengers: Doomsday',release:'2026-12-18',source:'https://movies.disney.com/avengers-doomsday',checked:'2026-11-02'};
export const CONNECTIONS=[['iron-man','avengers'],['thor','avengers'],['first-avenger','avengers'],['avengers','ultron'],['first-avenger','winter-soldier'],['winter-soldier','civil-war'],['ultron','civil-war'],['thor','ragnarok'],['civil-war','black-panther'],['strange','multiverse-madness'],['black-panther','wakanda-forever'],['avengers','infinity-war'],['guardians','infinity-war'],['ragnarok','infinity-war'],['infinity-war','endgame'],['civil-war','brave-new-world'],['winter-soldier','thunderbolts']];
export function duration(minutes){return `${Math.floor(minutes/60)}h${minutes%60?` ${minutes%60}m`:''}`;}
export function priorityScore(movie){return movie.priority==='high'?1000*movie.weight:movie.priority==='useful'?10*movie.weight:1;}
export function planRoute(movies,hours,watchedIds=[]){
 if(!Number.isFinite(hours)||hours<0||hours>100000)throw new Error('Invalid time budget');
 const known=new Set(movies.map(m=>m.id));
 if(!Array.isArray(watchedIds)||watchedIds.some(id=>!known.has(id)))throw new Error('Unknown watched movie');
 const watched=new Set(watchedIds), candidates=movies.filter(m=>!watched.has(m.id));
 const budget=Math.floor(hours*60+1e-7), capacity=Math.min(budget,candidates.reduce((n,m)=>n+m.runtime,0));
 // Each group offers mutually exclusive choices. Keep Infinity War with Endgame for newcomers.
 const iw=candidates.find(m=>m.id==='infinity-war'), eg=candidates.find(m=>m.id==='endgame');
 const paired=iw&&eg;
 const groups=candidates.filter(m=>!paired||!['infinity-war','endgame'].includes(m.id)).map(m=>[[m]]);
 if(paired)groups.push([[iw],[iw,eg]]);
 let states=new Map([[0,{score:0,selected:[]}]]),examined=0;
 for(const options of groups){
  const next=new Map(states);
  for(const [minutes,state] of states)for(const option of options){
   examined++;const used=minutes+option.reduce((n,m)=>n+m.runtime,0);if(used>capacity)continue;
   const score=state.score+option.reduce((n,m)=>n+priorityScore(m),0);
   if(!next.has(used)||score>next.get(used).score)next.set(used,{score,selected:[...state.selected,...option]});
  }
  states=next;
 }
 let used=0,best=states.get(0);
 for(const [minutes,value] of states)if(value.score>best.score||(value.score===best.score&&minutes<used)){used=minutes;best=value;}
 const selected=[...best.selected].sort((a,b)=>a.release.localeCompare(b.release)), chosen=new Set(selected.map(m=>m.id));
 const covered=new Set(movies.filter(m=>watched.has(m.id)||chosen.has(m.id)).flatMap(m=>m.topics));
 return {selected,used,budget,remaining:budget-used,examined,score:best.score,covered:[...covered],missing:Object.keys(TOPICS).filter(t=>!covered.has(t)),omitted:candidates.filter(m=>!chosen.has(m.id)),gaps:CONNECTIONS.filter(([a,b])=>chosen.has(b)&&!watched.has(a)&&!chosen.has(a)),highPriorityRemaining:candidates.filter(m=>m.priority==='high'&&!chosen.has(m.id)),fits:selected.length>0||!candidates.length,shortfall:candidates.length?Math.max(0,Math.min(...candidates.map(m=>m.runtime))-budget):0};
}
