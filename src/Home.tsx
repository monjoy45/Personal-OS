import {useState,type FormEvent} from 'react';import {useD} from './data';import {List,ImageSlot} from './ui';
import {add,amt,dayRatio,iso,lvl,streaks,type Item} from './lib';
const A:[string,string][]=[['Exercise','#/health'],['Skills','#/career'],['Experience','#/career'],['Reconnection','#/reconnect'],['Finance','#/finance'],['Network','#/career']];
const P=(i:number,r:number):[number,number]=>[150+r*Math.sin(i*Math.PI/3),150-r*Math.cos(i*Math.PI/3)];
function Radar(){const{items,nn,journal,doneBy}=useD(),T=new Date();const c=(l:string,f:(x:Item)=>boolean=()=>true)=>items.rows.filter(x=>x.list==l&&f(x)).length;
 const exIds=nn.rows.filter(n=>/exercise/i.test(n.title)).map(n=>n.id);let ex=0,n=0;
 for(let i=0;i<30;i++){const d=add(T,-i);if(d.getDay()==0)continue;n++;const s=doneBy.get(iso(d));if(s&&exIds.some(id=>s.has(id)))ex++}
 const v=[ex/(n||1),c('acl',x=>x.done)/10,c('prl',x=>x.category=='completed')/5,(journal.rows.filter(j=>j.content||j.mood).length+c('al')+c('ovl',x=>x.done)+c('bd',x=>x.done))/10,(c('ms',x=>x.done)+c('fl',x=>x.done))/10,c('ct')/15].map(x=>Math.min(1,x));
 return <svg className="hex" viewBox="0 0 300 300" role="img" aria-label="Life dimensions">
 {[.33,.66,1].map(r=><polygon key={r} points={A.map((_,i)=>P(i,95*r).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,.14)"/>)}
 {A.map((_,i)=><line key={i} x1="150" y1="150" x2={P(i,95)[0]} y2={P(i,95)[1]} stroke="rgba(255,255,255,.14)"/>)}
 <polygon points={v.map((x,i)=>P(i,Math.max(4,95*x)).join(',')).join(' ')} fill="rgba(255,255,255,.1)" stroke="#f2f2f0" strokeWidth="1.2"/>
 {A.map((a,i)=>{const[x,y]=P(i,115),[px,py]=P(i,Math.max(4,95*v[i])),t=`${a[0]}: ${(v[i]*10).toFixed(1)} / 10`;return <g key={a[0]}><a href={a[1]}><text x={x} y={y+3} textAnchor="middle">{a[0]}<title>{t}</title></text></a><circle cx={px} cy={py} r="3" fill="#f2f2f0"><title>{t}</title></circle></g>})}</svg>}
function Today(){const{nn,doneBy,toggle}=useD(),[edit,setEdit]=useState(false),[t,setT]=useState(''),T=new Date(),TD=iso(T),k=doneBy.get(TD);
 const todays=nn.rows.filter(n=>!(n.skip_sunday&&T.getDay()==0));
 const submit=(e:FormEvent)=>{e.preventDefault();const title=t.trim().slice(0,120);if(title){nn.add({title,skip_sunday:false,sort_order:nn.rows.length});setT('')}};
 return <div className="tile"><h3>Today <span className="m" style={{fontWeight:400}}>{T.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</span></h3>
 <div>{todays.map(n=>{const d=!!k?.has(n.id);return <div key={n.id} className={`row ${d?'dn':''}`}><input type="checkbox" checked={d} aria-label={n.title} onChange={()=>toggle(n.id,TD)}/><span className="t">{n.title}</span>
  {edit&&<><label className="sm"><input type="checkbox" checked={n.skip_sunday} onChange={e=>nn.patch(n.id,{skip_sunday:e.target.checked})}/> skip Sun</label><button aria-label="Remove" onClick={()=>confirm('Remove this non-negotiable and its history?')&&nn.remove(n.id)}>×</button></>}</div>})}
 <div style={{marginTop:12}}>{edit&&<form style={{display:'flex',gap:8,marginBottom:8}} onSubmit={submit}><input style={{flex:1}} placeholder="New non-negotiable" required maxLength={120} value={t} onChange={e=>setT(e.target.value)}/><button>Add</button></form>}
 <button onClick={()=>setEdit(!edit)} style={{border:0,padding:0,minHeight:0,color:'var(--t3)'}}>{edit?'Done editing':'Edit non-negotiables'}</button></div></div>
 <div style={{marginTop:24}}><List list="todo" cats={['High','Medium','Low']} dt ph="Add a task or deadline" empty="Nothing flexible today."/></div></div>}
function Calendar(){const{nn,doneBy}=useD(),[mo,setMo]=useState(0),T=new Date(),TD=iso(T),b=new Date(T.getFullYear(),T.getMonth()+mo,1),n=new Date(b.getFullYear(),b.getMonth()+1,0).getDate();
 return <div className="tile"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><h3 style={{margin:0}}>{b.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</h3><span><button aria-label="Previous month" onClick={()=>setMo(mo-1)}>‹</button> <button aria-label="Next month" onClick={()=>setMo(mo+1)}>›</button></span></div>
 <div className="cal">{'MTWTFSS'.split('').map((c,i)=><span key={i}>{c}</span>)}{Array.from({length:(b.getDay()+6)%7},(_,i)=><span key={'p'+i}/>)}
 {Array.from({length:n},(_,i)=>{const d=new Date(b.getFullYear(),b.getMonth(),i+1),r=iso(d)>TD?0:dayRatio(d,nn.rows,doneBy);return <i key={i} className={`${r==1?'f':r>0?'p':''} ${iso(d)==TD?'n':''}`}>{r==1?'✓':i+1}</i>})}</div></div>}
function Streaks(){const{nn,doneBy}=useD(),T=new Date(),TD=iso(T),s=streaks(T,nn.rows,doneBy),st=add(T,-(33*7+T.getDay()));
 return <div className="tile"><div className="stats"><div><b>{s.cur}</b><span className="sm">current streak</span></div><div><b>{s.lng}</b><span className="sm">longest</span></div><div><b>{s.full}</b><span className="sm">full days</span></div></div>
 <div className="heatw"><div className="heat">{Array.from({length:7*34},(_,i)=>{const d=add(st,i),fut=iso(d)>TD;return <i key={i} className={fut?'x':'l'+lvl(dayRatio(d,nn.rows,doneBy))} title={iso(d)}/>})}</div></div>
 <p className="sm" style={{marginTop:8}}>Sundays skip exercise.</p></div>}
function Gateway(){const{items,health,urls,profile}=useD(),TD=iso(new Date()),L=(l:string)=>items.rows.filter(x=>x.list==l),o=(l:string,f:(x:Item)=>boolean=x=>!x.done)=>L(l).filter(f).length,h=health.rows.find(r=>r.date==TD),nx=L('ms').find(x=>!x.done&&(x.amount??0)>profile.saved);
 const g:[string,string,string,string][]=[['career','Career',`${o('acl')} to study, ${o('prl',x=>x.category!='completed')} projects live, ${o('jb',x=>x.category=='Applied'||x.category=='Interview')} applications moving`,'acad'],['health','Health',`Water ${h?.water||0} of 8 today`+(h?.sleep?`, slept ${h.sleep}h`:''),'ride'],['finance','Finance',nx?'Next: '+nx.title:'Roadmap complete','fin'],['reconnect','Reconnection',`${o('bd',x=>x.done)} of ${L('bd').length} done before I die`,'self']];
 return <div className="grid gate">{g.map(([h,t,x,k])=><a key={h} className="gt" href={`#/${h}`} style={urls[k]?{backgroundImage:`url(${urls[k]})`}:undefined}><div><b>{t}</b><span className="sm" style={{color:'var(--t2)'}}>{x}</span></div></a>)}</div>}
export function Home({onProfile}:{onProfile:()=>void}){const{profile:p}=useD();
 return <section className="pg on" id="home"><div className="box"><div className="hd"><div><h1>{p.name}</h1><p className="sub">{p.bio}</p></div><p className="sm">{p.focus&&'Focus: '+p.focus}</p></div>
 <div className="grid home"><div className="a grid" style={{gap:16}}><ImageSlot k="portrait" cap="Add portrait" onClick={onProfile} style={{margin:0,aspectRatio:'4/5'}}/>
 <div className="tile" style={{padding:16}}><Radar/><p className="sm" style={{textAlign:'center'}}>Fills as you act. Click an axis to open it.</p></div>
 <ImageSlot k="skyline" cap="City banner" style={{margin:0,aspectRatio:'16/9',minHeight:0}}/></div>
 <Today/><div className="grid" style={{gap:24,alignContent:'start'}}><div className="tile"><h3>Brain dump</h3><List list="brain" cats={['idea','research','remember']} ph="Capture a thought" empty="Empty head. Good."/></div><div className="tile"><h3>Coming up</h3><List list="ev" dt ev ph="Event" empty="Nothing scheduled."/></div></div>
 <div className="c"><Calendar/><Streaks/></div></div></div><Gateway/></section>}
