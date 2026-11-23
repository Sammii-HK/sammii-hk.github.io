import type { Metadata } from 'next';
import { LabsShell } from '../src/components/labs/LabsShell';
import { LabLibrary } from './LabLibrary';
import { LIBRARY } from './library-model';
export const metadata: Metadata = { title: 'Labs: interactive work, research and visual explanations', description: 'Explore Sammii’s interactive experiments, visual charts and research. Search by topic or choose the kind of work you want to explore.', alternates: { canonical: 'https://labs.sammii.dev/' } };
export default function LabsPage(){return <LabsShell><div className="labs-index"><header className="labs-index-head"><p className="section-eyebrow">Labs</p><h1 className="labs-index-title">Ideas you can get inside.</h1><p className="labs-index-lead">Move something, inspect a model, follow the research. A collection of interactive explorations, charts and the writing behind the work. Choose a topic, or start with the kind of thing you want to explore.</p></header><LabLibrary items={LIBRARY} /></div></LabsShell>;}
