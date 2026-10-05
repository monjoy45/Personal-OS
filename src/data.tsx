import {createClient} from '@supabase/supabase-js';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import type {Comp,DoneBy,Health,ImgRow,Item,Journal,NN,ProfileRow,Routine} from './lib';
export const configured=!!import.meta.env.VITE_SUPABASE_URL;
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL||'http://localhost',import.meta.env.VITE_SUPABASE_ANON_KEY||'x');
type Row={id?:string};
/** Rows for one table with optimistic writes; a failed write restores the previous rows and reports the error. */
export function useRows<T extends Row>(table:string,order='created_at'){
 const [rows,set]=useState<T[]>([]),[err,setErr]=useState('');
 useEffect(()=>{let live=true;sb.from(table).select('*').order(order).then(({data,error})=>{if(!live)return;if(error)setErr(error.message);else set(data as T[])});return()=>{live=false}},[table,order]);
 const fail=(prev:T[],m:string)=>{set(prev);setErr(m)};
 return{rows,err,
  async add(r:Partial<T>){const tmp={...r,id:'tmp'+Math.random()} as T,prev=rows;set(x=>[...x,tmp]);const{data,error}=await sb.from(table).insert(r as never).select().single();if(error)fail(prev,error.message);else{setErr('');set(x=>x.map(y=>y===tmp?data as T:y))}},
  async patch(id:string|undefined,p:Partial<T>){if(!id||id.startsWith('tmp'))return;const prev=rows;set(x=>x.map(y=>y.id==id?{...y,...p}:y));const{error}=await sb.from(table).update(p as never).eq('id',id);if(error)fail(prev,error.message);else setErr('')},
  async remove(id:string|undefined){if(!id||id.startsWith('tmp'))return;const prev=rows;set(x=>x.filter(y=>y.id!=id));const{error}=await sb.from(table).delete().eq('id',id);if(error)fail(prev,error.message);else setErr('')},
  async upsert(r:Partial<T>,match:(x:T)=>boolean,conflict:string){const prev=rows;set(x=>x.some(match)?x.map(y=>match(y)?{...y,...r}:y):[...x,r as T]);const{data,error}=await sb.from(table).upsert(r as never,{onConflict:conflict}).select().single();if(error)fail(prev,error.message);else{setErr('');set(x=>x.map(y=>match(y)?data as T:y))}}};
}
async function resize(file:File){if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>1e7)throw new Error('Use a JPEG, PNG or WebP under 10 MB');
 const bm=await createImageBitmap(file),s=Math.min(1,1000/bm.width),c=document.createElement('canvas');c.width=bm.width*s;c.height=bm.height*s;c.getContext('2d')!.drawImage(bm,0,0,c.width,c.height);
 return new Promise<Blob>((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('Could not read image')),'image/jpeg',.8))}
export const uploadImage=async(uid:string,slot:string,blob:Blob)=>{const path=`${uid}/${slot}.jpg`;const{error}=await sb.storage.from('images').upload(path,blob,{upsert:true,contentType:'image/jpeg'});if(error)throw error;return path};
const make=()=>null as unknown as ReturnType<typeof build>;
function build(uid:string,email:string){
 const items=useRows<Item>('items'),nn=useRows<NN>('non_negotiables','sort_order'),comp=useRows<Comp>('completions'),health=useRows<Health>('health_daily','date'),journal=useRows<Journal>('journal_entries','date'),routine=useRows<Routine>('routine','day'),prof=useRows<ProfileRow>('profiles','updated_at'),imgs=useRows<ImgRow>('images');
 const [urls,setUrls]=useState<Record<string,string>>({}),[ierr,setIerr]=useState('');
 useEffect(()=>{const p=imgs.rows.filter(r=>!urls[r.slot]&&r.path);if(!p.length)return;sb.storage.from('images').createSignedUrls(p.map(r=>r.path),3600).then(({data})=>{if(data)setUrls(u=>{const n={...u};data.forEach(d=>{const r=p.find(x=>x.path==d.path);if(r&&d.signedUrl)n[r.slot]=d.signedUrl});return n})})},[imgs.rows]);// eslint-disable-line
 const doneBy=useMemo<DoneBy>(()=>{const m:DoneBy=new Map();comp.rows.forEach(c=>{if(!m.has(c.date))m.set(c.date,new Set());m.get(c.date)!.add(c.nn_id)});return m},[comp.rows]);
 const p0=prof.rows[0],profile={name:p0?.name??email.split('@')[0],bio:p0?.bio??'',focus:p0?.focus??'',saved:Number(p0?.saved??0)};
 const setImage=async(slot:string,file:File)=>{try{setIerr('');const path=await uploadImage(uid,slot,await resize(file));await imgs.upsert({slot,path},r=>r.slot==slot,'user_id,slot');const{data}=await sb.storage.from('images').createSignedUrl(path,3600);if(data)setUrls(u=>({...u,[slot]:data.signedUrl}))}catch(e){setIerr('Image upload failed: '+(e as Error).message)}};
 const toggle=(nnId:string,date:string)=>{const ex=comp.rows.find(r=>r.nn_id==nnId&&r.date==date);if(ex)comp.remove(ex.id);else comp.add({nn_id:nnId,date})};
 const err=[items,nn,comp,health,journal,routine,prof,imgs].map(h=>h.err).find(Boolean)||ierr;
 return{uid,items,nn,comp,health,journal,routine,prof,profile,urls,setImage,doneBy,toggle,err};
}
const Ctx=createContext(make());
export const useD=()=>useContext(Ctx);
export function DataProvider({uid,email,children}:{uid:string;email:string;children:ReactNode}){return <Ctx.Provider value={build(uid,email)}>{children}</Ctx.Provider>}
