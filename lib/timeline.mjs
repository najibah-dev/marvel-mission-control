import {DESTINATION} from './planner.mjs';
const DAY=86400000;
export function dateNumber(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('Choose a valid date');
 const n=Date.parse(value+'T00:00:00Z');
 if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==value)throw new Error('Choose a valid date');
 return n;
}
export function localToday(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function timeUntilRelease(today,targetDate=DESTINATION.release,weeklyHours=2){
 if(!Number.isFinite(weeklyHours)||weeklyHours<0||weeklyHours>20)throw new Error('Choose 0 to 20 hours per week');
 const start=dateNumber(today),end=dateNumber(targetDate),days=Math.max(0,Math.round((end-start)/DAY));
 if(days>3660)throw new Error('Choose a deadline within ten years');
 return {days,weeks:days/7,availableMinutes:Math.floor(days*weeklyHours*60/7),ended:end<=start};
}
export function scheduleRoute(route,today,weeklyHours){
 if(!route.length||weeklyHours<=0)return [];
 let minutes=0;
 return route.map(movie=>{minutes+=movie.runtime;const day=Math.max(0,Math.ceil(minutes*7/(weeklyHours*60))-1);return {id:movie.id,finishBy:new Date(dateNumber(today)+day*DAY).toISOString().slice(0,10)};});
}
export function restoreJourney(raw,legacy,movies){
 const saved=raw?JSON.parse(raw):legacy?JSON.parse(legacy):{};
 const defaults={weeklyHours:2,targetDate:DESTINATION.release,watched:[]};
 if(!saved||typeof saved!=='object'||Array.isArray(saved))return defaults;
 const ids=new Set(movies.map(m=>m.id));let targetDate=defaults.targetDate;
 try{dateNumber(saved.targetDate);if(saved.targetDate>='2020-01-01'&&saved.targetDate<='2035-12-31')targetDate=saved.targetDate;}catch{}
 return {weeklyHours:Number.isFinite(saved.weeklyHours)&&saved.weeklyHours>=0&&saved.weeklyHours<=20?Math.round(saved.weeklyHours*2)/2:2,targetDate,watched:Array.isArray(saved.watched)?[...new Set(saved.watched.filter(id=>ids.has(id)))]:[]};
}
