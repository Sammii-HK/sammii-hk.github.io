import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
async function readModule(file){const source=fs.readFileSync(file,'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const {projects}=await readModule('app/common/data/projects.ts');
const exploration=JSON.parse(fs.readFileSync('app/labs/explorations/catalogue.json','utf8')).items;
const chartsModule=await readModule('app/labs/charts/registry.ts');
const chartList=Object.values(chartsModule).find(Array.isArray)??[];
const imageMap=JSON.parse(fs.readFileSync('app/common/utils/image-map.json','utf8'));
const overrides=JSON.parse(fs.readFileSync('app/common/utils/screenshot-overrides.json','utf8'));
const previousPath='docs/quality/portfolio-audit-20261120.json';
const previous=fs.existsSync(previousPath)?JSON.parse(fs.readFileSync(previousPath,'utf8')).items:[];
const rows=projects.map(project=>{const id=project.id.split('/').at(-1);const image=overrides[id]?`public${overrides[id]}`:`public/assets/images/${id}.${imageMap[id]??'jpg'}`;const json=`content/case-studies/${project.caseStudy}.json`;const md=`content/case-studies/${project.caseStudy}.md`;const study=project.caseStudy?(fs.existsSync(json)?json:fs.existsSync(md)?md:null):null;const content=study?fs.readFileSync(study,'utf8'):'';return {id:project.id,title:project.title,kind:'project',placement:project.home,url:project.liveUrl??null,caseStudy:study,image,imageExists:fs.existsSync(image),imageUpdated:fs.existsSync(image)?fs.statSync(image).mtime.toISOString():null,structured:study?.endsWith('.json')??false,studyWords:content.split(/\s+/).length,sourceReview:'pending',visualReview:'pending',caseStudyReview:study?'pending':'missing',http:null};});
for(const e of exploration)rows.push({id:e.id,title:e.title,kind:'exploration',url:`https://labs.sammii.dev/explorations/${e.slug}/`,sources:e.sources?.length??0,limitations:e.limitations??'',sourceReview:'pending',visualReview:'pending',http:null});
for(const c of chartList)rows.push({id:c.id??c.slug,title:c.title,kind:'chart',url:c.href??`https://labs.sammii.dev/charts/${c.slug}/`,sourceReview:'pending',visualReview:'pending',http:null});
for(const row of rows){const old=previous.find(item=>item.id===row.id&&item.kind===row.kind);if(old?.url===row.url)row.http=old.http;}
const report={generatedAt:new Date().toISOString(),scope:'Every portfolio catalogue entry, Labs exploration and registered chart. HTTP checks do not establish visual polish, correctness or interaction quality.',counts:{projects:projects.length,explorations:exploration.length,charts:chartList.length},items:rows};
fs.mkdirSync('docs/quality',{recursive:true});const out='docs/quality/portfolio-audit-20261120.json';fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts:report.counts,missingImages:rows.filter(r=>r.kind==='project'&&!r.imageExists).map(r=>r.id),missingCaseStudies:rows.filter(r=>r.kind==='project'&&!r.caseStudy).map(r=>r.id)}));
if(process.argv.includes('--http')){let i=0;async function worker(){while(i<rows.length){const row=rows[i++];if(!row.url||!/^https?:/.test(row.url))continue;try{const response=await fetch(row.url,{signal:AbortSignal.timeout(15000),redirect:'follow'});row.http={status:response.status,finalUrl:response.url};await response.body?.cancel();}catch(error){row.http={error:error.message};}}}await Promise.all(Array.from({length:3},worker));report.generatedAt=new Date().toISOString();fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checked:rows.filter(r=>r.http).length,issues:rows.filter(r=>r.http&&(r.http.error||r.http.status>=400)).map(r=>({id:r.id,url:r.url,...r.http}))}));}
