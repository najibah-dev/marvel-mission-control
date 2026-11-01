type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
declare global { interface Document { modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}; } }
export function registerPlanReader(read:()=>unknown){
 const controller=new AbortController();
 if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'get_marvel_watch_plan',description:'Read the current visible Marvel watch plan, budget, and watched titles. Does not change progress or make AI requests.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(input===null||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object');return read();}},{signal:controller.signal})).catch(()=>{});}catch{}}
 return ()=>controller.abort();
}
