import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
const adapter = readFileSync('scripts/exploration-icons-adapter.js','utf8');
function run(selector: string, text: string) {
  let result: unknown[] | undefined;
  const control = {textContent:text,matches:(s:string)=>s===selector,replaceChildren:(...children:unknown[])=>{result=children;}};
  const context = vm.createContext({icons:{Play:'Play',Pause:'Pause',RotateCcw:'RotateCcw',Info:'Info',ArrowUpRight:'ArrowUpRight',Plus:'Plus',Minus:'Minus'},document:{createElement:()=>({innerHTML:'',content:{firstElementChild:'lucide-svg'}}),createTextNode:(t:string)=>t,addEventListener:()=>{}},window:{addEventListener:()=>{}}});
  vm.runInContext(adapter,context);
  context.control=control;
  vm.runInContext('adapt(control)',context);
  return result;
}
describe('exploration presentation icons',()=>{
  it('ships the current generated Lucide adapter',()=>{
    expect(()=>execFileSync(process.execPath,['scripts/generate-exploration-icons.mjs','--check'])).not.toThrow();
  });
  it('replaces transport symbols without replacing buttons or their handlers',()=>{
    expect(run('button','▶ Play sequence')).toEqual(['lucide-svg',' Play sequence']);
    expect(run('button','Ⅱ Pause')).toEqual(['lucide-svg',' Pause']);
    expect(run('button','↻ Replay')).toEqual(['lucide-svg',' Replay']);
  });
  it('keeps maths, data and ordinary label punctuation intact',()=>{
    expect(run('button','Add +1')).toBeUndefined();
    expect(run('button','1×')).toBeUndefined();
    expect(run('button','What happens?')).toBeUndefined();
    expect(run('button','Play sequence')).toBeUndefined();
  });
  it('uses existing accessible help and zoom labels and retains link text',()=>{
    expect(run('button.ph-help','?')).toEqual(['lucide-svg','']);
    expect(run('button.sky-zoom-button','−')).toEqual(['lucide-svg','']);
    expect(run('a','Evidence & model context ↗')).toEqual(['lucide-svg',' Evidence & model context']);
  });
});
