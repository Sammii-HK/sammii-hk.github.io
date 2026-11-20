import {describe,it,expect} from 'vitest';
import {LIBRARY,filterLibrary} from '../../labs/library-model';
import {EXPLORATIONS} from '../../labs/explorations/registry';
import {CHARTS} from '../../labs/charts/registry';
describe('Labs content architecture',()=>{
 it('includes every exploration and chart',()=>{expect(LIBRARY.filter(i=>i.kind==='Exploration')).toHaveLength(EXPLORATIONS.length);expect(LIBRARY.filter(i=>i.kind==='Chart')).toHaveLength(CHARTS.length);});
 it('routes the three research examples to studies, with their interactive material secondary',()=>{for(const id of ['moth-drawings','why-this-take-won','teaching-a-computer-to-paint']){const item=LIBRARY.find(i=>i.id===id)!;expect(item.kind).toBe('Research and writing');expect(item.href).toMatch(/sammii.dev\/projects\//);expect(item.secondary?.href).toBeTruthy();}});
 it('search combines subject words, type and topic without losing the full catalogue',()=>{const chart=LIBRARY.find(i=>i.kind==='Chart')!;expect(filterLibrary(LIBRARY,chart.title,'Chart',chart.topic)).toContainEqual(chart);expect(filterLibrary(LIBRARY,'unfindableabc','all','all')).toEqual([]);expect(filterLibrary(LIBRARY,'','all','all')).toHaveLength(LIBRARY.length);});
 it('every card has a usable destination',()=>{expect(new Set(LIBRARY.map(i=>i.id)).size).toBe(LIBRARY.length);for(const item of LIBRARY){if(item.href){expect(item.href).toMatch(/^https:\/\//);expect(item.href).not.toContain('undefined');}else{expect(item.kind).toBe('Lab project');}}});
});
