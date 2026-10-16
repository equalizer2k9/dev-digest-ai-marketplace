import { useEffect, useState } from 'react';

export type Route =
  | { page: 'home' }
  | { page: 'plugin'; name: string }
  | { page: 'artifact'; id: string }
  | { page: 'whats-new' }
  | { page: 'getting-started' }
  | { page: 'not-found' };

export function parseHash(hash: string): Route {
  const path = decodeURIComponent(hash.replace(/^#/, '')) || '/';
  if (path === '/') return { page: 'home' };
  if (path === '/whats-new') return { page: 'whats-new' };
  if (path === '/getting-started') return { page: 'getting-started' };
  const plugin = /^\/plugin\/([^/]+)$/.exec(path);
  if (plugin) return { page: 'plugin', name: plugin[1] };
  const artifact = /^\/artifact\/([^/]+:[^/]+)$/.exec(path);
  if (artifact) return { page: 'artifact', id: artifact[1] };
  return { page: 'not-found' };
}

export const href = {
  home: () => '#/',
  plugin: (name: string) => `#/plugin/${encodeURIComponent(name)}`,
  artifact: (id: string) => `#/artifact/${id.split(':').map(encodeURIComponent).join(':')}`,
  whatsNew: () => '#/whats-new',
  gettingStarted: () => '#/getting-started',
};

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
