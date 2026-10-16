import type { Catalog } from '../lib/data';
import { href } from '../lib/router';
import { CopyCommand } from '../components/CopyButton';
import { MarkdownFile } from '../components/Markdown';
import { TypeBadge } from '../components/TypeBadge';
import { NotFoundPage } from './NotFoundPage';
import { t } from '../i18n/t';

export function PluginPage({ catalog, name }: { catalog: Catalog; name: string }) {
  const { index } = catalog;
  const plugin = index.plugins.find((p) => p.name === name);
  if (!plugin) return <NotFoundPage message={t('plugin.notFound', { name })} />;
  const artifacts = index.artifacts.filter((a) => a.plugin === plugin.name);
  const skills = artifacts.filter((a) => a.type === 'skill');
  const agents = artifacts.filter((a) => a.type === 'agent');
  const known = new Set(index.plugins.map((p) => p.name));

  return (
    <main className="page page--detail">
      <div className="detail__head">
        <TypeBadge kind="plugin" />
        <h1>{plugin.displayName ?? plugin.name}</h1>
        <p className="lead">{plugin.description}</p>
        <CopyCommand command={plugin.installCommand} label={t('plugin.copyInstall')} />
      </div>

      <div className="detail">
        <aside className="facts">
          <dl>
            <dt>{t('plugin.version')}</dt>
            <dd>{plugin.version ?? '—'}</dd>
            <dt>{t('plugin.owner')}</dt>
            <dd>{plugin.author?.url ? <a href={plugin.author.url} target="_blank" rel="noopener noreferrer">{plugin.author.name}</a> : (plugin.author?.name ?? '—')}</dd>
            {plugin.license && (<><dt>{t('plugin.license')}</dt><dd>{plugin.license}</dd></>)}
            {plugin.category && (<><dt>{t('plugin.category')}</dt><dd>{plugin.category}</dd></>)}
            <dt>{t('plugin.compatibility')}</dt>
            <dd>
              {plugin.claudeCode ? t('plugin.claudeCode', { range: plugin.claudeCode }) : '—'}
              {plugin.compatibility['Tested on'] && <div className="muted small">{plugin.compatibility['Tested on']}</div>}
            </dd>
            <dt>{t('plugin.dependencies')}</dt>
            <dd>
              {plugin.dependencies.length === 0 ? (
                t('plugin.noDependencies')
              ) : (
                <ul className="plain">
                  {plugin.dependencies.map((d) => (
                    <li key={d.name}>
                      {known.has(d.name) ? <a href={href.plugin(d.name)}>{d.name}</a> : d.name}
                      {d.version && <span className="muted"> {d.version}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
            <dt>{t('plugin.source')}</dt>
            <dd>
              {plugin.repository ? (
                <a href={`${plugin.repository}/tree/main/${plugin.source}`} target="_blank" rel="noopener noreferrer">{plugin.source}</a>
              ) : (
                plugin.source
              )}
            </dd>
          </dl>

          <h2 className="facts__title">{t('plugin.components')}</h2>
          {[
            { title: t('plugin.skills'), list: skills },
            { title: t('plugin.agents'), list: agents },
          ]
            .filter((g) => g.list.length > 0)
            .map((g) => (
              <div key={g.title}>
                <h3 className="facts__subtitle">{g.title}</h3>
                <ul className="plain components">
                  {g.list.map((a) => (
                    <li key={a.id}>
                      <a href={href.artifact(a.id)}><TypeBadge kind={a.type} /> {a.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </aside>

        <article className="detail__body">
          <MarkdownFile path={plugin.readmePath} />
        </article>
      </div>
    </main>
  );
}
