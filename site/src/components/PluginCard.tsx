import type { Artifact, Plugin } from '../lib/types';
import { href } from '../lib/router';
import { t } from '../i18n/t';

export function PluginCard({ plugin, artifacts }: { plugin: Plugin; artifacts: Artifact[] }) {
  const skills = artifacts.filter((a) => a.type === 'skill').length;
  const agents = artifacts.filter((a) => a.type === 'agent').length;
  return (
    <a className="card" href={href.plugin(plugin.name)}>
      <div className="card__head">
        <h3 className="card__title">{plugin.displayName ?? plugin.name}</h3>
        {plugin.version && <span className="badge">v{plugin.version}</span>}
      </div>
      <p className="card__text">{plugin.description}</p>
      <div className="card__meta">
        {plugin.category && <span className="tag">{plugin.category}</span>}
        {skills > 0 && <span>{skills === 1 ? t('common.skillCountOne') : t('common.skillCount', { count: skills })}</span>}
        {agents > 0 && <span>{agents === 1 ? t('common.agentCountOne') : t('common.agentCount', { count: agents })}</span>}
      </div>
    </a>
  );
}
