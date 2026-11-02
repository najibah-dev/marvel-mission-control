import movies from './catalog.json' with { type: 'json' };
import { CONNECTIONS, planRoute } from './planner.mjs';
export function prepareExplanation(input: unknown) {
 if (!input || typeof input !== 'object') throw new Error('Invalid request');
 const {movieId,hours,watched}=input as {movieId:unknown;hours:unknown;watched:unknown};
 if(typeof movieId!=='string'||typeof hours!=='number'||!Array.isArray(watched)||watched.length>movies.length||watched.some(id=>typeof id!=='string')||new Set(watched).size!==watched.length)throw new Error('Invalid plan');
 const movie=movies.find(m=>m.id===movieId);
 if(!movie)throw new Error('Unknown movie');
 const plan=planRoute(movies,hours,watched);
 const parentIds=CONNECTIONS.filter(([,to]:string[])=>to===movieId).map(([from]:string[])=>from);
 const parents=movies.filter(m=>parentIds.includes(m.id));
 const retrieved=[movie,...parents];
 const context={selectedMovieId:movie.id,watchOrder:plan.selected.map((m:typeof movie)=>m.id),destination:'Avengers: Doomsday',priority:movie.priority,priorityBasis:'Editorial context recommendation, not an official prerequisite',budgetMinutes:plan.budget,plannedMinutes:plan.used,
  status:watched.includes(movieId)?'already watched':plan.selected.some((m:typeof movie)=>m.id===movieId)?'included':'outside budget',
  hasCatchUpPlan:plan.selected.length>0,
  notes:retrieved.map(m=>({id:m.id,title:m.title,runtime:m.runtime,note:m.why,watched:watched.includes(m.id)}))};
 const statusNote=context.status==='already watched'?'You have already watched this movie.':context.status==='included'?'This movie is included in your current plan.':'This movie is not selected in your current plan.';
 return {movie,context,statusNote,retrievedIds:retrieved.map(m=>m.id),messages:[
  {role:'system',content:'You explain a curated Marvel viewing plan to a beginner. Use ONLY the supplied notes and plan facts. Do not introduce plot events, outcomes, character identities, or lore from memory. Never call a film essential or the route complete. Describe only the editorial value of the selected movie. Do not make budget or selection claims; the app will add its verified status. Use descriptive statements, never viewing instructions. Explain only selectedMovieId and its value in this plan. Notes are not a viewing sequence. Avoid statements about what to watch first, next, or later. Other notes are context, not watch instructions. Do not recommend additional films, propose a viewing sequence, alter the route, or calculate different runtimes. Return JSON with exactly text (two or three short sentences, at most 90 words) and sourceIds (IDs of supplied notes used). Cite at least the first supplied movie ID. Explain editorial choices as recommendations. No markdown.'},
  {role:'user',content:JSON.stringify(context)}
 ]};
}
export function validateExplanation(raw:string, allowedIds:string[], selectedId:string){
 const result=JSON.parse(raw);
 if(!result || typeof result!=='object' || Array.isArray(result) || Object.keys(result).sort().join(',')!=='sourceIds,text')throw new Error('Invalid model response');
 if(typeof result.text!=='string'||result.text.length<20||result.text.length>1200||result.text.trim().split(/\s+/).length>90||!Array.isArray(result.sourceIds)||!result.sourceIds.includes(selectedId)||result.sourceIds.some((id:unknown)=>typeof id!=='string'||!allowedIds.includes(id)))throw new Error('Invalid model response');
 return {text:result.text,sourceIds:[...new Set(result.sourceIds)]};
}
