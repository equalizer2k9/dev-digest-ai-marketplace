import MiniSearch from 'minisearch';
import type { CatalogIndex } from './types';

export interface SearchDoc {
  id: string;
  kind: 'plugin' | 'skill' | 'agent';
  name: string;
  plugin: string;
  description: string;
  keywords: string;
  text: string;
}

export type SearchHit = Pick<SearchDoc, 'id' | 'kind' | 'name' | 'plugin' | 'description'> & { score: number };

/** One index over plugins (README as text) and artifacts (SKILL.md / agent body as text). */
export function createSearch(index: CatalogIndex) {
  const search = new MiniSearch<SearchDoc>({
    fields: ['name', 'description', 'keywords', 'text'],
    storeFields: ['kind', 'name', 'plugin', 'description'],
    searchOptions: { prefix: true, fuzzy: 0.15, boost: { name: 4, keywords: 2, description: 2 } },
  });
  search.addAll([
    ...index.plugins.map<SearchDoc>((p) => ({
      id: `plugin:${p.name}`,
      kind: 'plugin',
      name: p.name,
      plugin: p.name,
      description: p.description,
      keywords: p.keywords.join(' '),
      text: p.text,
    })),
    ...index.artifacts.map<SearchDoc>((a) => ({
      id: a.id,
      kind: a.type,
      name: a.name,
      plugin: a.plugin,
      description: a.description,
      keywords: '',
      text: a.text,
    })),
  ]);
  return (query: string): SearchHit[] =>
    search.search(query).map((r) => ({
      id: r.id as string,
      kind: r.kind as SearchDoc['kind'],
      name: r.name as string,
      plugin: r.plugin as string,
      description: r.description as string,
      score: r.score,
    }));
}
