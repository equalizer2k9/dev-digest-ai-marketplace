import { t } from '../i18n/t';

export function TypeBadge({ kind }: { kind: 'plugin' | 'skill' | 'agent' }) {
  const label = kind === 'skill' ? t('artifact.skill') : kind === 'agent' ? t('artifact.agent') : t('artifact.plugin');
  return <span className={`type type--${kind}`}>{label}</span>;
}
