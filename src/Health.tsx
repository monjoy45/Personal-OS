import {Page,Tabs,List,ImageSlot} from './ui';import {useD} from './data';import {add,iso,type Health as H} from './lib';
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function Routine(){const{routine}=useD();return <div>{DAYS.map((d,i)=>{const r=routine.rows.find(x=>x.day==i);
 return <div className="rt" key={d}><span className="m">{d}</span><span contentEditable="plaintext-only" suppressContentEditableWarning role="textbox" aria-label={`${d} routine`} onBlur={e=>{const v=(e.currentTarget.textContent||'').trim().slice(0,100);if(v!=(r?.title??''))routine.upsert({day:i,title:v},x=>x.day==i,'user_id,day')}}>{r?.title}</span></div>})}</div>}
function Body(){const{health}=useD(),TD=iso(new Date()),e=health.rows.find(r=>r.date==TD);
 const set=(p:Partial<H>)=>health.upsert({date:TD,...p},r=>r.date==TD,'user_id,date');
 const num=(k:'sleep'|'weight',max:number)=>(ev:React.FocusEvent<HTMLInputElement>)=>{const v=ev.target.value;set({[k]:v===''?null:Math.min(max,Math.max(0,+v))})};
 const bars=Array.from({length:14},(_,i)=>health.rows.find(r=>r.date==iso(add(new Date(),i-13)))?.sleep||0);
 return <div className="grid c2"><div className="tile"><h3>Water</h3><div className="sq">{Array.from({length:8},(_,i)=><button key={i} className={(e?.water||0)>i?'on':''} aria-label={`${i+1} glasses`} onClick={()=>set({water:e?.water==i+1?i:i+1})}/>)}</div>
 <label className="sm">Sleep last night (hours)<br/><input type="number" step=".5" min="0" max="24" key={'s'+e?.sleep} defaultValue={e?.sleep??''} onBlur={num('sleep',24)}/></label><br/><br/>
 <label className="sm">Weight (kg)<br/><input type="number" step=".1" min="0" key={'w'+e?.weight} defaultValue={e?.weight??''} onBlur={num('weight',500)}/></label></div>
 <div className="tile"><h3>Sleep, last 14 days</h3><div className="bars">{bars.map((v,i)=><i key={i} style={{height:v/10*100+'%'}} title={v+'h'}/>)}</div></div></div>}
export function Health(){return <Page id="health" title="Health" note="Click a routine line to edit"><Tabs tabs={[['routine','Routine'],['body','Body'],['care','Care']]}>{t=>
 t=='routine'?<><div className="grid c4"><div><h3>Exercise routine</h3><Routine/></div><div><h3>Workout log</h3><List list="wl" ph="What did you do today?"/></div></div><ImageSlot k="gym" cap="Build the body that matches the mind." cls="band" style={{marginBottom:0}}/></>
 :t=='body'?<Body/>:<div className="grid c2"><ImageSlot k="ride" cap="Outdoors" style={{margin:0,aspectRatio:'4/5'}}/><List list="sk" cats={['skin','meds']} ph="Routine or medicine"/></div>}</Tabs></Page>}
