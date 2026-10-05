import {Page,Tabs,List,ImageSlot} from './ui';import {useD} from './data';import {fn} from './lib';
function Progress(){const{items,profile,prof}=useD(),ms=items.rows.filter(x=>x.list=='ms'),cur=profile.saved,nx=ms.find(x=>!x.done&&(x.amount??0)>cur),tg=nx?.amount??0;
 return <div className="tile"><label className="sm">Saved so far (₹)<br/><input type="number" min="0" key={cur} defaultValue={cur||''} onBlur={e=>prof.upsert({saved:Math.max(0,+e.target.value||0)},()=>true,'user_id')}/></label>
 <div className="pr"><i style={{width:(tg?Math.min(100,cur/tg*100):100)+'%'}}/></div><p className="sm">{nx?`₹${fn(tg-cur)} to go for ${nx.title}`:'Every listed milestone reached'}</p></div>}
function Road(){const{items,profile}=useD(),ms=items.rows.filter(x=>x.list=='ms'),dn=(x:typeof ms[0])=>x.done||(!!x.amount&&profile.saved>=x.amount),nx=ms.findIndex(x=>!dn(x));
 return <div className="road">{ms.map((x,i)=>{const p=x.title.split(' ');return <div key={x.id} className={dn(x)?'d':i==nx?'nx':''}><b>{p[0]}</b><p className="sm">{p.slice(1).join(' ')}{i==nx&&' · next'}</p></div>})}</div>}
export function Finance(){return <Page id="finance" title="Finance" note="Put an amount in a milestone title, like ₹2L Goal"><Tabs tabs={[['road','Roadmap'],['learn','Learning']]}>{t=>
 t=='road'?<><Road/><div className="grid c2"><Progress/><List list="ms" ph="₹ amount and name"/></div><ImageSlot k="fin" cap="The long game" cls="band" style={{marginBottom:0}}/></>
 :<div className="grid c2"><div><h3>Learning and documents</h3><List list="fl" cats={['learn','watch','doc']} ph="Topic, video, or link"/></div><div><h3>Achievements</h3><List list="fa" ph="Achievement"/></div></div>}</Tabs></Page>}
