import type { Catalog } from '../lib/data';
import { href } from '../lib/router';
import { Markdown } from '../components/Markdown';
import { t } from '../i18n/t';

export function WhatsNewPage({ catalog }: { catalog: Catalog }) {
  const { releases, index } = catalog;
  return (
    <main className="page page--narrow">
      <h1>{t('whatsNew.title')}</h1>
      <p className="muted">{t('whatsNew.intro')}</p>
      {releases.length === 0 && <p>{t('whatsNew.empty')}</p>}
      <ol className="releases">
        {releases.map((r) => (
          <li key={`${r.plugin}@${r.version}`} className="release">
            <div className="release__head">
              <a href={href.plugin(r.plugin)} className="release__plugin">{r.plugin}</a>
              <span className="badge">v{r.version}</span>
              {r.date && <time dateTime={r.date}>{r.date}</time>}
              {r.tag ? (
                <a className="muted small" href={`${index.marketplace.repository}/releases/tag/${encodeURIComponent(r.tag)}`} target="_blank" rel="noopener noreferrer">
                  {t('whatsNew.tag', { tag: r.tag })}
                </a>
              ) : (
                <span className="muted small">{t('whatsNew.untagged')}</span>
              )}
            </div>
            <Markdown source={r.notes} />
          </li>
        ))}
      </ol>
    </main>
  );
}
