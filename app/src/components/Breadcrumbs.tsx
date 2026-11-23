import { ChevronRight } from 'lucide-react';
export type Crumb = { label: string; href?: string };
export function Breadcrumbs({crumbs}:{crumbs:Crumb[]}) {
 const schema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((crumb,i)=>({'@type':'ListItem',position:i+1,name:crumb.label,...(crumb.href?{item:new URL(crumb.href,'https://sammii.dev').href}:{})}))};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><nav className="site-breadcrumbs" aria-label="Breadcrumb"><ol>{crumbs.map((crumb,i)=><li key={`${i}-${crumb.label}`}>{i>0&&<ChevronRight size={12} aria-hidden="true"/>}{crumb.href?<a href={crumb.href}>{crumb.label}</a>:<span aria-current="page">{crumb.label}</span>}</li>)}</ol></nav></>;
}
