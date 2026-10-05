import {useEffect,useRef,useState} from 'react';import {Page,Tabs,List,ImageSlot} from './ui';import {useD} from './data';import {fmt,iso} from './lib';
function Journal(){const{journal}=useD(),TD=iso(new Date()),e=journal.rows.find(r=>r.date==TD),[t,setT]=useState(''),typing=useRef(false),timer=useRef<number>();
 useEffect(()=>{if(!typing.current)setT(e?.content??'')},[e?.content]);
 const save=(p:{content?:string;mood?:number|null})=>journal.upsert({date:TD,...p},r=>r.date==TD,'user_id,date');
 const old=journal.rows.filter(r=>r.date!=TD&&(r.content||r.mood)).sort((a,b)=>a.date<b.date?1:-1).slice(0,6);
 return <div className="tile" style={{maxWidth:640}}><h3>Today</h3><div className="mood">{[1,2,3,4,5].map(n=><button key={n} className={e?.mood==n?'on':''} aria-label={`Mood ${n} of 5`} onClick={()=>save({mood:n})}>{n}</button>)}</div>
 <textarea rows={4} style={{width:'100%'}} placeholder="How did today actually feel?" maxLength={20000} value={t} onChange={ev=>{const v=ev.target.value;setT(v);typing.current=true;clearTimeout(timer.current);timer.current=window.setTimeout(()=>{save({content:v});typing.current=false},800)}}/>
 <div style={{marginTop:16}}>{old.map(r=><div className="row" key={r.date}><span className="m sm" style={{width:56}}>{fmt(r.date)}</span><span className="t">{r.content}</span><span className="sm">{r.mood||''}/5</span></div>)}</div></div>}
export function Reconnect(){return <Page id="reconnect" title="Reconnection" note="Not a productivity section"><Tabs tabs={[['journal','Journal'],['self','Self'],['die','Before I die']]}>{t=>
 t=='journal'?<Journal/>
 :t=='self'?<><div className="grid c3"><div><ImageSlot k="self" cap="Aligning with self" style={{margin:'0 0 16px',aspectRatio:'4/5'}}/><List list="al" ph="A path or idea that helped"/></div><div><h3>Things to stop</h3><List list="stop" ph="Stop doing"/></div><div><h3>Things to become</h3><List list="bec" ph="Become"/></div></div><div className="tile" style={{marginTop:48}}><h3>Overalls: happy, safe, people</h3><List list="ovl" cats={['happy','safe','relation']} ph="Add"/></div></>
 :<div className="grid c2"><ImageSlot k="die" cap="Before I die" style={{margin:0,aspectRatio:'4/5'}}/><List list="bd" cats={['travel','build','learn','experience']} dt pr ph="Before I die"/></div>}</Tabs></Page>}
