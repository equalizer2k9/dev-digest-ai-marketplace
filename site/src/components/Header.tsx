import type { Route } from '../lib/router';
import { href } from '../lib/router';
import { t } from '../i18n/t';

export function Header({ route, repository }: { route: Route; repository: string }) {
  const current = (page: Route['page']) => (route.page === page ? 'page' : undefined);
  return (
    <header className="header">
      <a className="header__brand" href={href.home()}>
        <span className="header__logo" aria-hidden="true">◆</span>
        {t('app.title')}
      </a>
      <nav className="header__nav">
        <a href={href.home()} aria-current={current('home')}>{t('nav.catalog')}</a>
        <a href={href.whatsNew()} aria-current={current('whats-new')}>{t('nav.whatsNew')}</a>
        <a href={href.gettingStarted()} aria-current={current('getting-started')}>{t('nav.gettingStarted')}</a>
        <a href={repository} target="_blank" rel="noopener noreferrer">{t('nav.repository')}</a>
      </nav>
    </header>
  );
}
