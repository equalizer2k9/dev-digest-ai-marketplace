import { useMemo } from 'react';
import { renderMarkdown } from '../lib/markdown';
import { useText } from '../lib/data';
import { t } from '../i18n/t';

/** Renders sanitized Markdown from a string. */
export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => renderMarkdown(source), [source]);
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Fetches a generated body file and renders it. */
export function MarkdownFile({ path }: { path: string }) {
  const text = useText(path);
  if (text.state === 'loading') return <p className="muted">{t('app.loading')}</p>;
  if (text.state === 'error') return <p className="error">{t('app.loadError', { error: text.error })}</p>;
  return <Markdown source={text.data} />;
}
