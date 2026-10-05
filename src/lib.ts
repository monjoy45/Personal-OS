export type NN={id:string;title:string;skip_sunday:boolean;sort_order:number};
export type Comp={id?:string;nn_id:string;date:string};
export type Item={id?:string;list:string;title:string;category:string|null;done:boolean;notes:string;url:string;progress:number;due_date:string|null;amount:number|null};
export type Health={id?:string;date:string;water:number|null;sleep:number|null;weight:number|null};
export type Journal={id?:string;date:string;mood:number|null;content:string};
export type Routine={id?:string;day:number;title:string};
export type ProfileRow={id?:string;name:string;bio:string;focus:string;saved:number};
export type ImgRow={id?:string;slot:string;path:string};
export const iso=(d:Date)=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
export const add=(d:Date,n:number)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
export const dd=(s:string,today=new Date())=>Math.round((new Date(s+'T00:00').getTime()-new Date(iso(today)+'T00:00').getTime())/864e5);
export const fmt=(s:string)=>new Date(s+'T00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
export const fn=(n:number)=>new Intl.NumberFormat('en-IN').format(n);
const U:Record<string,number>={k:1e3,l:1e5,cr:1e7};
/** Parses amounts like "₹50K", "₹1L", "₹2Cr" from a milestone title. Called when the title is saved, not at render. */
export const amt=(t:string)=>{const m=/₹\s*([\d.,]+)\s*(K|L|Cr)?/i.exec(t);return m?(parseFloat(m[1].replace(/,/g,''))||0)*(U[(m[2]??'').toLowerCase()]??1):0};
export type DoneBy=Map<string,Set<string>>;
export const dayRatio=(d:Date,nn:Pick<NN,'id'|'skip_sunday'>[],doneBy:DoneBy)=>{const a=nn.filter(n=>!(n.skip_sunday&&d.getDay()==0));if(!a.length)return 0;const k=doneBy.get(iso(d));return a.filter(n=>k?.has(n.id)).length/a.length};
export const lvl=(r:number)=>r==0?0:r<.5?1:r<.75?2:r<1?3:4;
/** A full day = every applicable non-negotiable done. Today being unfinished does not break the current streak. */
export function streaks(today:Date,nn:Pick<NN,'id'|'skip_sunday'>[],doneBy:DoneBy,days=200){let cur=0,lng=0,run=0,full=0;
for(let i=days;i>=0;i--){if(dayRatio(add(today,-i),nn,doneBy)==1){run++;full++;lng=Math.max(lng,run)}else run=0}
for(let i=0;i<=days;i++){if(dayRatio(add(today,-i),nn,doneBy)==1)cur++;else if(i)break}return{cur,lng,full}}
export const safeUrl=(u:string)=>{try{const x=new URL(u);return x.protocol=='http:'||x.protocol=='https:'?x.href:''}catch{return''}};
