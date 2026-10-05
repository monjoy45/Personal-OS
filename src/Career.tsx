import {Page,Tabs,List,ImageSlot} from './ui';
const m0={margin:0};
export function Career(){return <Page id="career" title="Career" note="Open any item for notes, a link or progress"><Tabs tabs={[['study','Study'],['build','Projects'],['jobs','Jobs']]}>{t=>
 t=='study'?<div className="grid c2"><ImageSlot k="acad" cap="Study desk" style={{...m0,aspectRatio:'4/5'}}/><List list="acl" cats={['code','theory']} pr ph="Add something to study"/></div>
 :t=='build'?<><ImageSlot k="proj" cap="Build" cls="band" style={{margin:'0 0 32px'}}/><List list="prl" cats={['ongoing','urgent','completed']} pr ph="Add a project"/></>
 :<div className="grid c3"><div><h3>Applications</h3><List list="jb" cats={['Saved','Applied','OA','Interview','Offer','Rejected']} dt ph="Company, role"/></div><div><h3>Contacts and companies</h3><List list="ct" ph="Name, company, note"/></div><div><h3>Documents and links</h3><List list="dc" ph="Document or link"/></div></div>}</Tabs></Page>}
