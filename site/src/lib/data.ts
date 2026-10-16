import { useEffect, useState } from 'react';
import type { CatalogIndex, Release, Stats } from './types';

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchText(path: string): Promise<string> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.text();
}

export interface Catalog {
  index: CatalogIndex;
  releases: Release[];
  stats: Stats;
}

export type Loadable<T> = { state: 'loading' } | { state: 'error'; error: string } | { state: 'ready'; data: T };

export function useCatalog(): Loadable<Catalog> {
  const [value, setValue] = useState<Loadable<Catalog>>({ state: 'loading' });
  useEffect(() => {
    Promise.all([fetchJson<CatalogIndex>('index.json'), fetchJson<Release[]>('releases.json'), fetchJson<Stats>('stats.json')])
      .then(([index, releases, stats]) => setValue({ state: 'ready', data: { index, releases, stats } }))
      .catch((e: unknown) => setValue({ state: 'error', error: e instanceof Error ? e.message : String(e) }));
  }, []);
  return value;
}

export function useText(path: string | null): Loadable<string> {
  const [value, setValue] = useState<Loadable<string>>({ state: 'loading' });
  useEffect(() => {
    if (!path) return;
    let live = true;
    setValue({ state: 'loading' });
    fetchText(path)
      .then((text) => live && setValue({ state: 'ready', data: text }))
      .catch((e: unknown) => live && setValue({ state: 'error', error: e instanceof Error ? e.message : String(e) }));
    return () => {
      live = false;
    };
  }, [path]);
  return value;
}
