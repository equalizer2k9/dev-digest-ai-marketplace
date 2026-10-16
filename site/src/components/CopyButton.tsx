import { useState } from 'react';
import { t } from '../i18n/t';

type State = 'idle' | 'copied' | 'failed';

/** Shows a command and copies it to the clipboard. */
export function CopyCommand({ command, label }: { command: string; label: string }) {
  const [state, setState] = useState<State>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 2000);
  };
  return (
    <div className="copy">
      <code className="copy__command">{command}</code>
      <button type="button" className="button" onClick={copy} aria-live="polite">
        {state === 'copied' ? t('plugin.copied') : state === 'failed' ? t('plugin.copyFailed') : label}
      </button>
    </div>
  );
}
