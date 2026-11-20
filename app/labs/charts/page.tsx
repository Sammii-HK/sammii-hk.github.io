import type { Metadata } from 'next';
import { LabsShell } from '../../src/components/labs/LabsShell';
import { LabLibrary } from '../LabLibrary';
import { LIBRARY } from '../library-model';

export const metadata: Metadata = {
  title: 'Charts: visual explanations you can explore',
  description: 'Interactive explanations of colour, typography, motion and how the browser works. Search by topic and inspect the model behind each chart.',
  alternates: { canonical: 'https://labs.sammii.dev/charts/' },
};

export default function ChartsPage() {
  return <LabsShell><div className="labs-index"><header className="labs-index-head"><p className="section-eyebrow">Charts</p><h1 className="labs-index-title">Information design, about the tools.</h1><p className="labs-index-lead">Interactive explanations of colour, typography, motion and the browser. Change a parameter, inspect the model and follow the sources.</p></header><LabLibrary items={LIBRARY} initialKind="Chart" /></div></LabsShell>;
}
