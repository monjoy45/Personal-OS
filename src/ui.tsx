import {Fragment,useEffect,useRef,useState,type CSSProperties,type FormEvent,type ReactNode} from 'react';
import {useD} from './data';import {amt,dd,fmt,safeUrl,type Item} from './lib';
export function Dlg({open,onClose,lock,children}:{open:boolean;onClose?:()=>void;lock?:boolean;children:ReactNode}){const r=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=r.current!;if(open&&!d.open)d.showModal();if(!open&&d.open)d.close()},[open]);
 return <dialog ref={r} onClose={onClose} onCancel={e=>lock&&e.preventDefault()}>{children}</dialog>}
export function Tabs({tabs,children}:{tabs:[string,string][];children:(t:string)=>ReactNode}){const [t,setT]=useState(tabs[0][0]);
 return <><div className="tabs">{tabs.map(([k,l])=><button key={k} className={t==k?'on':''} onClick={()=>setT(k)}>{l}</button>)}</div><div className="tp on">{children(t)}</div></>}
export const Page=({id,title,note,children}:{id:string;title:string;note:string;children:ReactNode})=><section className="pg on" id={id}><div className="box"><div className="hd"><h2>{title}</h2><p className="sm">{note}</p></div>{children}</div></section>;
export function ImageSlot({k,cap,style,cls='',onClick}:{k:string;cap:string;style?:CSSProperties;cls?:string;onClick?:()=>void}){const{urls,setImage}=useD(),f=useRef<HTMLInputElement>(null),u=urls[k];
 const go=()=>onClick?onClick():f.current?.click();
 return <figure className={`img ${cls} ${u?'has':''}`} tabIndex={0} role="button" aria-label={cap} style={{...style,backgroundImage:u?`url(${u})`:undefined}} onClick={go} onKeyDown={e=>e.key=='Enter'&&go()}><span>{cap}</span><input ref={f} type="file" accept="image/jpeg,image/png,image/webp" hidden onClick={e=>e.stopPropagation()} onChange={e=>{const x=e.target.files?.[0];if(x)setImage(k,x);e.target.value=''}}/></figure>}
function Detail({x,pr}:{x:Item;pr?:boolean}){const{items}=useD(),[p,setP]=useState(x.progress);const u=safeUrl(x.url);
 return <div className="dt"><textarea defaultValue={x.notes} placeholder="Notes" aria-label="Notes" maxLength={5000} onBlur={e=>e.target.value!=x.notes&&items.patch(x.id,{notes:e.target.value})}/>
 <input defaultValue={x.url} placeholder="Link (https://)" aria-label="Link" onBlur={e=>{const v=e.target.value.trim();if(v!=x.url&&(v===''||safeUrl(v)))items.patch(x.id,{url:v})}}/>
 {pr&&<label className="sm">Progress {p}%<input type="range" value={p} style={{width:'100%'}} onChange={e=>setP(+e.target.value)} onPointerUp={()=>items.patch(x.id,{progress:p})} onKeyUp={()=>items.patch(x.id,{progress:p})}/></label>}
 {u&&<a className="sm" href={u} target="_blank" rel="noopener noreferrer" style={{color:'var(--t2)'}}>Open link</a>}</div>}
export function List({list,cats,pr,dt,ev,ph='Add',empty='Nothing here yet.'}:{list:string;cats?:string[];pr?:boolean;dt?:boolean;ev?:boolean;ph?:string;empty?:string}){
 const{items}=useD(),[f,setF]=useState('all'),[open,setOpen]=useState<Set<string>>(new Set()),[t,setT]=useState(''),[d,setD]=useState('');
 const a=items.rows.filter(x=>x.list==list).sort((p,q)=>dt?(p.due_date??'z')>(q.due_date??'z')?1:-1:0),r=a.filter(x=>f=='all'||x.category==f);
 const tog=(id:string)=>setOpen(s=>{const n=new Set(s);if(n.has(id))n.delete(id);else n.add(id);return n});
 const submit=(e:FormEvent)=>{e.preventDefault();const title=t.trim().slice(0,200);if(!title)return;items.add({list,title,category:cats?(cats.includes(f)?f:cats[0]):null,done:false,notes:'',url:'',progress:0,due_date:dt&&d?d:null,amount:list=='ms'?amt(title):null});setT('');setD('')};
 return <div className="list">
 {cats&&a.length>0&&<div className="chips">{['all',...cats].map(c=><button type="button" key={c} className={f==c?'on':''} onClick={()=>setF(c)}>{c}{c!='all'&&' '+a.filter(x=>x.category==c).length}</button>)}</div>}
 {r.length?r.map(x=>{const id=x.id!,n=x.due_date?dd(x.due_date):0;return <Fragment key={id}><div className={`row ${x.done?'dn':''} ${x.due_date&&!x.done&&n<0&&!ev?'od':''}`}>
  <input type="checkbox" checked={x.done} aria-label="Done" onChange={e=>items.patch(id,{done:e.target.checked})}/>
  <span className="t" role="button" tabIndex={0} aria-expanded={open.has(id)} onClick={()=>tog(id)} onKeyDown={e=>e.key=='Enter'&&tog(id)}>{x.title}</span>
  {x.progress>0&&<span className="bar" title={x.progress+'%'}><i style={{width:x.progress+'%'}}/></span>}
  {x.due_date&&<span className="m sm">{ev&&(n<0?'past':n==0?'today':n+'d')} {fmt(x.due_date)}</span>}
  {cats&&<select value={x.category??cats[0]} aria-label="Category" onChange={e=>items.patch(id,{category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select>}
  <button aria-label="Remove" onClick={()=>confirm('Remove this item?')&&items.remove(id)}>×</button></div>{open.has(id)&&<Detail x={x} pr={pr}/>}</Fragment>}):<p className="empty">{empty}</p>}
 <form onSubmit={submit}><input placeholder={ph} required maxLength={200} aria-label="New item" value={t} onChange={e=>setT(e.target.value)}/>{dt&&<input type="date" aria-label="Date" value={d} onChange={e=>setD(e.target.value)}/>}<button>Add</button></form></div>}
