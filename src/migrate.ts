import {sb,uploadImage} from './data';import {amt} from './lib';
type Old=Record<string,any>;// eslint-disable-line
const chk=(r:{error:{message:string}|null})=>{if(r.error)throw new Error(r.error.message)};
/** One-time import of the prototype's localStorage state (key pos1). Sample history is not imported. */
export async function migrate(old:Old,uid:string){
 const p=old.prof||{};chk(await sb.from('profiles').upsert({name:String(p.n||'').slice(0,80),bio:String(p.b||'').slice(0,300),focus:String(p.f||'').slice(0,200),saved:Math.max(0,+old.cur||0)},{onConflict:'user_id'}));
 for(const[slot,v]of Object.entries<string>(old.img||{})){const path=await uploadImage(uid,slot,await (await fetch(v)).blob());chk(await sb.from('images').upsert({slot,path},{onConflict:'user_id,slot'}))}
 const ids:Record<string,string>={};
 for(const[i,n]of(old.nn||[]).entries()){const r=await sb.from('non_negotiables').insert({title:String(n.t).slice(0,120),skip_sunday:!!n.sun,sort_order:i}).select('id').single();chk(r);ids[n.id]=r.data!.id}
 if(!old.demo){const c=Object.entries<string[]>(old.done||{}).flatMap(([date,l])=>l.filter(i=>ids[i]).map(i=>({nn_id:ids[i],date})));if(c.length)chk(await sb.from('completions').insert(c))}
 const items=Object.entries<Old[]>(old.L||{}).flatMap(([list,a])=>a.map(x=>({list,title:String(x.t).slice(0,200),category:x.c??null,done:!!x.d,notes:String(x.n||'').slice(0,5000),url:/^https?:\/\//.test(x.u||'')?x.u:'',progress:Math.min(100,Math.max(0,+x.p||0)),due_date:x.dt||null,amount:list=='ms'?amt(String(x.t)):null})));
 if(items.length)chk(await sb.from('items').insert(items));
 const h=Object.entries<Old>(old.hl||{}).map(([date,x])=>({date,water:x.w??null,sleep:x.s??null,weight:x.wt??null}));if(h.length)chk(await sb.from('health_daily').insert(h));
 const j=Object.entries<Old>(old.j||{}).map(([date,x])=>({date,mood:x.m??null,content:String(x.t||'').slice(0,20000)}));if(j.length)chk(await sb.from('journal_entries').insert(j));
 const rt=(old.rt||[]).map((title:string,day:number)=>({day,title:String(title).slice(0,100)})).filter((r:{title:string})=>r.title);if(rt.length)chk(await sb.from('routine').insert(rt));
}
