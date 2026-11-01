import { prepareExplanation, validateExplanation } from './explain.ts';
export function createExplanationHandler(getKey:()=>string|undefined, providerFetch:typeof fetch=fetch){
const cached=new Map<string,{at:number;value:Record<string,unknown>}>();
const limits=new Map<string,{at:number;count:number}>();
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
return async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return json({error:'Origin not allowed'},403);
 const now=Date.now(),ip=request.headers.get('cf-connecting-ip')||'local';
 if(limits.size>1000)for(const [key,entry] of limits)if(now-entry.at>60000)limits.delete(key);
 const window=limits.get(ip);
 if(window&&now-window.at<60000&&window.count>=12)return json({error:'Please wait a minute before requesting another explanation.'},429);
 limits.set(ip,window&&now-window.at<60000?{...window,count:window.count+1}:{at:now,count:1});
 let prepared;
 try{const body=await request.text();if(body.length>3000)return json({error:'Request too large'},413);prepared=prepareExplanation(JSON.parse(body));}catch{return json({error:'Choose a valid movie, time budget, and watched list.'},400);}
 const fallback=(reason:string)=>json({text:prepared.statusNote+' '+prepared.movie.why,mode:'curated',reason,sourceIds:[prepared.movie.id],retrievedIds:prepared.retrievedIds});
 const key=getKey();
 if(!key)return fallback('Live AI is not configured. Showing the editorial explanation.');
 const cacheKey=JSON.stringify(prepared.context),hit=cached.get(cacheKey);
 if(hit&&now-hit.at<3600000)return json({...hit.value,cached:true});
 const model='openai/gpt-oss-20b';
 try{
  const response=await providerFetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,messages:prepared.messages,temperature:0.2,max_completion_tokens:1024,reasoning_effort:'low',include_reasoning:false,response_format:{type:'json_schema',json_schema:{name:'movie_explanation',strict:true,schema:{type:'object',properties:{text:{type:'string'},sourceIds:{type:'array',items:{type:'string',enum:prepared.retrievedIds}}},required:['text','sourceIds'],additionalProperties:false}}}}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)return fallback(response.status===429?'AI is busy. Showing the editorial explanation.':'AI is temporarily unavailable. Showing the editorial explanation.');
  const data=await response.json() as {choices:{message:{content:string}}[];usage?:{prompt_tokens:number;completion_tokens:number}};
  const result=validateExplanation(data.choices[0].message.content,prepared.retrievedIds,prepared.movie.id);
  const value={...result,text:prepared.statusNote+' '+result.text,mode:'ai',model,inputTokens:data.usage?.prompt_tokens??null,outputTokens:data.usage?.completion_tokens??null,latencyMs:Date.now()-now,retrievedIds:prepared.retrievedIds,cached:false};
  if(cached.size>=200)cached.delete(cached.keys().next().value!);
  cached.set(cacheKey,{at:now,value});
  return json(value);
 }catch{return fallback('The AI response could not be used. Showing the editorial explanation.');}
}

}
