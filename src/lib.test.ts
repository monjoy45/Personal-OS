import {describe,expect,it} from 'vitest';import {amt,streaks,dayRatio,dd,iso} from './lib';
const nn=[{id:'a',skip_sunday:true},{id:'b',skip_sunday:false}];
const by=(o:Record<string,string[]>)=>new Map(Object.entries(o).map(([k,v])=>[k,new Set(v)]));
describe('amt',()=>{it('parses K, L, Cr',()=>{expect(amt('₹50K Fund')).toBe(5e4);expect(amt('₹1L')).toBe(1e5);expect(amt('₹2Cr')).toBe(2e7);expect(amt('none')).toBe(0)})});
describe('streaks',()=>{const today=new Date(2026,9,7);// Wed
it('skips exercise on Sunday, ignores unfinished today',()=>{const s=streaks(today,nn,by({'2026-10-04':['b'],'2026-10-05':['a','b'],'2026-10-06':['a','b']}));expect(s).toEqual({cur:3,lng:3,full:3})});
it('partial day breaks the run',()=>{const s=streaks(today,nn,by({'2026-10-03':['a'],'2026-10-05':['a','b'],'2026-10-06':['a','b']}));expect(s.cur).toBe(2)});
it('future days and empty lists count as nothing',()=>{expect(dayRatio(new Date(2026,9,20),nn,by({}))).toBe(0);expect(dayRatio(today,[],by({}))).toBe(0)})});
describe('dd',()=>{it('compares local dates',()=>{const t=new Date(2026,9,7,23,30);expect(dd('2026-10-07',t)).toBe(0);expect(dd('2026-10-06',t)).toBe(-1);expect(iso(t)).toBe('2026-10-07')})});
