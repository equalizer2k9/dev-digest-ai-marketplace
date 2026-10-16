// Shapes of the files scripts/build-index.mjs writes into site/public/.

export interface Dependency {
  name: string;
  version: string | null;
}

export interface Plugin {
  name: string;
  displayName: string | null;
  version: string | null;
  description: string;
  category: string | null;
  keywords: string[];
  author: { name: string; url?: string; email?: string } | null;
  license: string | null;
  homepage: string | null;
  repository: string | null;
  dependencies: Dependency[];
  compatibility: Record<string, string>;
  claudeCode: string | null;
  installCommand: string;
  source: string;
  artifacts: string[];
  readmePath: string;
  text: string;
}

export interface Artifact {
  id: string;
  plugin: string;
  type: 'skill' | 'agent';
  name: string;
  description: string;
  source: string;
  bodyPath: string;
  text: string;
  // skills
  argumentHint?: string | null;
  userInvocable?: boolean;
  modelInvocable?: boolean;
  allowedTools?: string[];
  // agents
  model?: string | null;
  tools?: string[];
  maxTurns?: number | null;
}

export interface CatalogIndex {
  schemaVersion: number;
  commit: string | null;
  marketplace: {
    name: string;
    description: string;
    owner: { name: string; url?: string } | null;
    repository: string;
    addCommand: string;
  };
  plugins: Plugin[];
  artifacts: Artifact[];
}

export interface Release {
  plugin: string;
  version: string;
  date: string | null;
  tag: string | null;
  notes: string;
}

export interface Stats {
  plugins: number;
  skills: number;
  agents: number;
}
