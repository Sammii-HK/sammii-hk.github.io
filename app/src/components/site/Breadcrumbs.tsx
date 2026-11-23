'use client';
import { usePathname } from 'next/navigation';
import { Breadcrumbs as BreadcrumbTrail } from '../Breadcrumbs';
import { routeBreadcrumbs } from './breadcrumb-model';

export function Breadcrumbs({ labs = false }: { labs?: boolean }) {
  const crumbs = routeBreadcrumbs(usePathname(), labs);
  return crumbs.length ? <BreadcrumbTrail crumbs={crumbs} /> : null;
}
