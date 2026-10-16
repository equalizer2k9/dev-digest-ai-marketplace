import type { Catalog } from '../lib/data';
import { href } from '../lib/router';
import { MarkdownFile } from '../components/Markdown';
import { TypeBadge } from '../components/TypeBadge';
import { NotFoundPage } from './NotFoundPage';
import { t } from '../i18n/t';

export function ArtifactPage({ catalog, id }: { catalog: Catalog; id: string }) {
  const { index } = catalog;
  const artifact = index.artifacts.find((a) => a.id === id);
  if (!artifact) return <NotFoundPage message={t('artifact.notFound', { id })} />;
  const plugin = index.plugins.find((p) => p.name === artifact.plugin);
  const invocation =
    artifact.type === 'skill'
      ? !artifact.modelInvocable
        ? t('artifact.userOnly')
        : artifact.userInvocable === false
          ? t('artifact.modelOnly')
          : t('artifact.userAndModel')
      : null;

  return (
    <main className="page page--detail">
      <a className="back" href={href.plugin(artifact.plugin)}>{t('common.backToPlugin', { name: artifact.plugin })}</a>
      <div className="detail__head">
        <TypeBadge kind={artifact.type} />
        <h1>{artifact.name}</h1>
        <p className="lead">{artifact.description}</p>
      </div>

      <div className="detail">
        <aside className="facts">
          <dl>
            <dt>{t('artifact.namespacedName')}</dt>
            <dd><code>{artifact.id}</code></dd>
            <dt>{t('artifact.plugin')}</dt>
            <dd>
              <a href={href.plugin(artifact.plugin)}>{artifact.plugin}</a>
              {plugin?.version && <span className="muted"> v{plugin.version}</span>}
            </dd>
            {artifact.type === 'skill' && (
              <>
                <dt>{t('artifact.invoke')}</dt>
                <dd><code>/{artifact.id}{artifact.argumentHint ? ` ${artifact.argumentHint}` : ''}</code></dd>
                <dt>{t('artifact.invocation')}</dt>
                <dd>{invocation}</dd>
              </>
            )}
            {artifact.model && (<><dt>{t('artifact.model')}</dt><dd>{artifact.model}</dd></>)}
            {artifact.maxTurns != null && (<><dt>{t('artifact.maxTurns')}</dt><dd>{artifact.maxTurns}</dd></>)}
            {(artifact.tools?.length ?? 0) > 0 && (<><dt>{t('artifact.tools')}</dt><dd>{artifact.tools!.join(', ')}</dd></>)}
            {(artifact.allowedTools?.length ?? 0) > 0 && (<><dt>{t('artifact.tools')}</dt><dd>{artifact.allowedTools!.join(', ')}</dd></>)}
            <dt>{t('artifact.source')}</dt>
            <dd>
              <a href={`${index.marketplace.repository}/blob/main/${artifact.source}`} target="_blank" rel="noopener noreferrer">{artifact.source}</a>
            </dd>
          </dl>
        </aside>
        <article className="detail__body">
          <MarkdownFile path={artifact.bodyPath} />
        </article>
      </div>
    </main>
  );
}
