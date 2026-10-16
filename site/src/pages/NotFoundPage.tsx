import { href } from '../lib/router';
import { t } from '../i18n/t';

export function NotFoundPage({ message }: { message?: string }) {
  return (
    <main className="page page--narrow">
      <h1>{t('notFound.title')}</h1>
      {message && <p className="muted">{message}</p>}
      <p><a href={href.home()}>{t('notFound.back')}</a></p>
    </main>
  );
}
