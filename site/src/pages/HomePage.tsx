import { useMemo, useState } from 'react';
import type { Catalog } from '../lib/data';
import { createSearch } from '../lib/search';
import { href } from '../lib/router';
import { PluginCard } from '../components/PluginCard';
import { TypeBadge } from '../components/TypeBadge';
import { t } from '../i18n/t';

export function HomePage({ catalog }: { catalog: Catalog }) {
  const { index, stats } = catalog;
  const search = useMemo(() => createSearch(index), [index]);
  const [query, setQuery] = useState('');
  const q = query.trim();
  const hits = useMemo(() => (q ? search(q) : []), [q, search]);
  const pluginHits = hits.filter((h) => h.kind === 'plugin');
  const artifactHits = hits.filter((h) => h.kind !== 'plugin');
  const artifactsOf = (name: string) => index.artifacts.filter((a) => a.plugin === name);

  return (
    <main className="page">
      <section className="hero">
        <h1>{t('app.tagline')}</h1>
        <p className="muted">{index.marketplace.description}</p>
        <p className="stats">{t('home.stats', { ...stats })}</p>
        <label className="search">
          <span className="visually-hidden">{t('home.searchLabel')}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchLabel')}
            autoFocus
          />
        </label>
      </section>

      {!q && (
        <section>
          <h2>{t('home.allPlugins')}</h2>
          <div className="grid">
            {index.plugins.map((p) => (
              <PluginCard key={p.name} plugin={p} artifacts={artifactsOf(p.name)} />
            ))}
          </div>
        </section>
      )}

      {q && (
        <section aria-live="polite">
          <p className="muted">{hits.length ? t('home.results', { count: hits.length, query: q }) : t('home.noResults', { query: q })}</p>
          {pluginHits.length > 0 && (
            <>
              <h2>{t('home.pluginsHeading')}</h2>
              <div className="grid">
                {pluginHits.map((h) => {
                  const plugin = index.plugins.find((p) => p.name === h.name);
                  return plugin ? <PluginCard key={h.id} plugin={plugin} artifacts={artifactsOf(plugin.name)} /> : null;
                })}
              </div>
            </>
          )}
          {artifactHits.length > 0 && (
            <>
              <h2>{t('home.artifactsHeading')}</h2>
              <ul className="results">
                {artifactHits.map((h) => (
                  <li key={h.id}>
                    <a className="result" href={href.artifact(h.id)}>
                      <TypeBadge kind={h.kind} />
                      <code className="result__id">{h.id}</code>
                      <span className="result__text">{h.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </main>
  );
}
