'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { Select } from '../src/components/prism/Select';
import { libraryHref, filterLibrary, LIBRARY_KINDS, type LibraryItem, type LibraryKind } from './library-model';
export function LabLibrary({items, initialKind = 'all'}:{items:LibraryItem[]; initialKind?: LibraryKind | 'all'}) {
  const [hostname, setHostname] = useState('labs.sammii.dev');
  useEffect(() => { setHostname(window.location.hostname); }, []);
  const [query,setQuery]=useState('');const [kind,setKind]=useState<string>(initialKind);const [topic,setTopic]=useState('all');const [limit,setLimit]=useState(24);
  const topics=useMemo(()=>Array.from(new Set(items.map(i=>i.topic))).sort(),[items]);
  const results=useMemo(()=>filterLibrary(items,query,kind,topic),[items,query,kind,topic]);
  return <section id="library" className="labs-library" aria-labelledby="library-heading">
    <div className="labs-library-heading"><div><p className="section-eyebrow">Browse the collection</p><h2 id="library-heading">Find something to explore.</h2></div><p>Interactive work, explanations and research, labelled by what you can do with them.</p></div>
    <div className="labs-library-controls"><label className="labs-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search Labs</span><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setLimit(24);}} placeholder="Search topics, titles and techniques" /></label><Select label="Topic" value={topic} onChange={value=>{setTopic(value);setLimit(24);}} options={[{value:"all",label:"All topics"},...topics.map(value=>({value,label:value}))]} /></div>
    <div role="group" aria-label="Content type" className="labs-kind-filters">{['all',...LIBRARY_KINDS].map(k=><button type="button" key={k} aria-pressed={kind===k} onClick={()=>{setKind(k);setLimit(24);}}>{k==='all'?'Everything':k}<span>{k==='all'?items.length:items.filter(i=>i.kind===k).length}</span></button>)}</div>
    <div className="labs-results-summary"><p role="status">{results.length} {results.length===1?'piece':'pieces'}{query?` matching “${query}”`:''}</p>{(query||kind!=='all'||topic!=='all')&&<button type="button" onClick={()=>{setQuery('');setKind('all');setTopic('all');setLimit(24);}}><X size={14} aria-hidden="true" />Clear filters</button>}</div>
    {results.length===0?<p className="labs-empty">No work matches those filters. Try a broader topic or clear the search.</p>:<ul className="lab-grid" aria-label="Labs results">{results.slice(0,limit).map(item=><li key={item.id} className="lab-card"><div className="lab-card-body"><p className="lab-card-stack">{item.kind}</p><h3 className="lab-card-title">{item.href?<Link href={libraryHref(item.href, hostname)}>{item.title}<ArrowUpRight size={16} aria-hidden="true" /></Link>:item.title}</h3><p className="lab-card-info">{item.description}</p><div className="labs-topic-tags"><button type="button" aria-label={`Filter topic: ${item.topic}`} onClick={()=>{setTopic(item.topic);setLimit(24);}}>{item.topic}</button>{item.tags.filter(t=>t!==item.topic).slice(0,2).map(t=><span key={t}>{t}</span>)}</div><div className="lab-card-links">{item.href?<Link href={libraryHref(item.href, hostname)}>{item.kind==='Research and writing'?'Read the study':item.kind==='Chart'?'Open the chart':item.kind==='Exploration'?'Open the exploration':'Open the experiment'}<ArrowUpRight size={13} aria-hidden="true" /></Link>:<span>Project record. No public build available.</span>}{item.secondary&&<Link href={libraryHref(item.secondary.href, hostname)}>{item.secondary.label}<ArrowUpRight size={13} aria-hidden="true" /></Link>}</div></div></li>)}</ul>}
    {results.length>limit&&<button type="button" className="labs-load-more" onClick={()=>setLimit(n=>n+24)}>Show more ({results.length-limit} remaining)</button>}
  </section>;
}
