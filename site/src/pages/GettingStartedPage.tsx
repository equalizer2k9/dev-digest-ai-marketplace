import type { Catalog } from '../lib/data';
import { CopyCommand } from '../components/CopyButton';
import { t } from '../i18n/t';

export function GettingStartedPage({ catalog }: { catalog: Catalog }) {
  const { marketplace, plugins } = catalog.index;
  const repo = marketplace.addCommand.replace('/plugin marketplace add ', '');
  const example = plugins[plugins.length - 1]?.name ?? '<plugin>';
  const copy = t('plugin.copyInstall');
  return (
    <main className="page page--narrow">
      <h1>{t('gettingStarted.title')}</h1>

      <h2>{t('gettingStarted.addTitle')}</h2>
      <p>{t('gettingStarted.addText')}</p>
      <CopyCommand command={marketplace.addCommand} label={copy} />
      <p>{t('gettingStarted.addShellText')}</p>
      <CopyCommand command={`claude plugin marketplace add ${repo}`} label={copy} />
      <p>{t('gettingStarted.projectText')}</p>
      <CopyCommand command={`claude plugin marketplace add ${repo} --scope project`} label={copy} />

      <h2>{t('gettingStarted.installTitle')}</h2>
      <p>{t('gettingStarted.installText')}</p>
      <CopyCommand command={`/plugin install ${example}@${marketplace.name}`} label={copy} />
      <p>{t('gettingStarted.installScopeText')}</p>

      <h2>{t('gettingStarted.updateTitle')}</h2>
      <p>{t('gettingStarted.updateText')}</p>
      <CopyCommand command={`claude plugin marketplace update ${marketplace.name}`} label={copy} />
      <CopyCommand command={`claude plugin update ${example}@${marketplace.name}`} label={copy} />

      <h2>{t('gettingStarted.channelsTitle')}</h2>
      <p>{t('gettingStarted.channelsText')}</p>
      <CopyCommand command={`claude plugin marketplace add ${repo}#stable --scope project`} label={copy} />
      <p>
        <a href={`${marketplace.repository}/blob/main/docs/RELEASES.md#rollback`} target="_blank" rel="noopener noreferrer">
          {t('gettingStarted.channelsLink')}
        </a>
      </p>

      <h2>{t('gettingStarted.verifyTitle')}</h2>
      <p>{t('gettingStarted.verifyText')}</p>
      <CopyCommand command="claude plugin list" label={copy} />
      <CopyCommand command={`claude plugin details ${example}`} label={copy} />
    </main>
  );
}
