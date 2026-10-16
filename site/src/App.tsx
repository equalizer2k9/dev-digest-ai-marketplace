import { useCatalog } from './lib/data';
import { useRoute } from './lib/router';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { PluginPage } from './pages/PluginPage';
import { ArtifactPage } from './pages/ArtifactPage';
import { WhatsNewPage } from './pages/WhatsNewPage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { t } from './i18n/t';

export function App() {
  const route = useRoute();
  const catalog = useCatalog();

  if (catalog.state === 'loading') return <p className="page muted">{t('app.loading')}</p>;
  if (catalog.state === 'error') return <p className="page error">{t('app.loadError', { error: catalog.error })}</p>;

  const data = catalog.data;
  const commit = data.index.commit?.slice(0, 7);
  return (
    <>
      <Header route={route} repository={data.index.marketplace.repository} />
      {route.page === 'home' && <HomePage catalog={data} />}
      {route.page === 'plugin' && <PluginPage catalog={data} name={route.name} />}
      {route.page === 'artifact' && <ArtifactPage catalog={data} id={route.id} />}
      {route.page === 'whats-new' && <WhatsNewPage catalog={data} />}
      {route.page === 'getting-started' && <GettingStartedPage catalog={data} />}
      {route.page === 'not-found' && <NotFoundPage />}
      {commit && (
        <footer className="footer muted small">
          {t('app.footer', { commit })}
        </footer>
      )}
    </>
  );
}
