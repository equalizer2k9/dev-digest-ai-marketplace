#!/usr/bin/env node
// Builds the static data of the plugin catalog site from the marketplace sources. No dependencies.
//
//   node scripts/build-index.mjs [--out site/public]
//
// Writes into <out>:
//   index.json     marketplace, plugins and their artifacts (skills, agents) with search text
//   releases.json  one entry per plugin version, from CHANGELOG.md; tagged when a {name}--v{version} git tag exists
//   stats.json     counts of plugins, skills and agents
//   bodies/*.md    plugin READMEs and artifact bodies (frontmatter stripped), rendered by the site

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const read = (path) => readFileSync(path, 'utf8');
const readIfExists = (path) => (existsSync(path) ? read(path) : null);

/** Splits `---\n<frontmatter>\n---\n<body>`; returns { data, body }. Supports the flat YAML subset our manifests use. */
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line); // top-level keys only; nested blocks are skipped
    if (!kv) continue;
    data[kv[1]] = parseScalar(kv[2]);
  }
  return { data, body: match[2] };
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === '') return '';
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (/^".*"$/.test(value)) return value.slice(1, -1).replace(/\\"/g, '"');
  if (/^'.*'$/.test(value)) return value.slice(1, -1).replace(/''/g, "'");
  if (/^\[.*\]$/.test(value)) return value.slice(1, -1).split(',').map((v) => parseScalar(v)).filter((v) => v !== '');
  return value;
}

const list = (value) =>
  Array.isArray(value) ? value : typeof value === 'string' && value ? value.split(',').map((v) => v.trim()) : [];

/** Rewrites relative Markdown links and images to absolute GitHub URLs, outside fenced code blocks. */
export function absolutizeLinks(markdown, repoUrl, fileDir) {
  let inFence = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence) return line;
      return line.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, bang, text, href) => {
        if (/^([a-z]+:|#|\/)/i.test(href)) return whole;
        const path = posix.normalize(posix.join(fileDir, href));
        const kind = bang ? 'raw' : 'blob';
        return `${bang}[${text}](${repoUrl}/${kind}/main/${path})`;
      });
    })
    .join('\n');
}

/** Parses a two-column Markdown table (`| key | value |`) into an object, without Markdown emphasis. */
function parseKeyValueTable(markdown) {
  const out = {};
  for (const line of (markdown ?? '').split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 2 || !cells[0] || /^-+$/.test(cells[0])) continue;
    out[cells[0]] = cells[1].replace(/\*\*|`/g, '');
  }
  return out;
}

/** `## 1.0.0 — 2026-10-16` sections of a CHANGELOG. */
function parseChangelog(markdown) {
  const releases = [];
  const parts = (markdown ?? '').split(/^## /m).slice(1);
  for (const part of parts) {
    const [heading, ...rest] = part.split('\n');
    const m = /^v?(\d+\.\d+\.\d+[\w.-]*)\s*(?:[—–-]\s*(\d{4}-\d{2}-\d{2}))?/.exec(heading.trim());
    if (m) releases.push({ version: m[1], date: m[2] ?? null, notes: rest.join('\n').trim() });
  }
  return releases;
}

function gitTags(root) {
  try {
    const out = execFileSync('git', ['-C', root, 'tag', '-l', '*--v*', '--format=%(refname:short)\t%(creatordate:short)'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\n').filter(Boolean).map((l) => {
      const [tag, date] = l.split('\t');
      return { tag, date };
    });
  } catch {
    return [];
  }
}

function gitCommit(root) {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const repoUrlOf = (marketplace, plugins) =>
  (plugins.find((p) => p.repository)?.repository ?? marketplace.owner?.url ?? '').replace(/\.git$/, '');

const bodyFile = (id) => `bodies/${id.replace(/:/g, '--')}.md`;

export function buildIndex({ root = REPO_ROOT } = {}) {
  const marketplace = JSON.parse(read(join(root, '.claude-plugin/marketplace.json')));
  const manifests = marketplace.plugins.map((entry) => {
    const dir = join(root, entry.source);
    return { entry, dir, rel: posix.normalize(entry.source), manifest: JSON.parse(read(join(dir, '.claude-plugin/plugin.json'))) };
  });
  const repoUrl = repoUrlOf(marketplace, manifests.map((m) => m.manifest));
  const tags = gitTags(root);

  const plugins = [];
  const artifacts = [];
  const bodies = {};
  const releases = [];

  for (const { entry, dir, rel, manifest } of manifests) {
    const name = manifest.name;
    const pluginArtifacts = [];

    const skillsDir = join(dir, 'skills');
    if (existsSync(skillsDir)) {
      for (const skill of readdirSync(skillsDir).sort()) {
        const file = join(skillsDir, skill, 'SKILL.md');
        if (!existsSync(file)) continue;
        const { data, body } = parseFrontmatter(read(file));
        const artifactName = data.name || skill;
        pluginArtifacts.push({
          type: 'skill',
          name: artifactName,
          description: data.description ?? '',
          argumentHint: data['argument-hint'] || null,
          userInvocable: data['user-invocable'] !== false,
          modelInvocable: data['disable-model-invocation'] !== true,
          allowedTools: list(data['allowed-tools']),
          source: `${rel}/skills/${skill}/SKILL.md`,
          body: absolutizeLinks(body.trim(), repoUrl, `${rel}/skills/${skill}`),
        });
      }
    }

    const agentsDir = join(dir, 'agents');
    if (existsSync(agentsDir)) {
      for (const file of readdirSync(agentsDir).filter((f) => f.endsWith('.md')).sort()) {
        const { data, body } = parseFrontmatter(read(join(agentsDir, file)));
        pluginArtifacts.push({
          type: 'agent',
          name: data.name || file.replace(/\.md$/, ''),
          description: data.description ?? '',
          model: data.model ?? null,
          tools: list(data.tools),
          maxTurns: data.maxTurns ?? null,
          source: `${rel}/agents/${file}`,
          body: absolutizeLinks(body.trim(), repoUrl, `${rel}/agents`),
        });
      }
    }

    for (const a of pluginArtifacts) {
      const id = `${name}:${a.name}`;
      const { body, ...meta } = a;
      bodies[bodyFile(id)] = body;
      artifacts.push({ id, plugin: name, ...meta, bodyPath: bodyFile(id), text: body });
    }

    const readme = readIfExists(join(dir, 'README.md')) ?? '';
    bodies[bodyFile(name)] = absolutizeLinks(readme.trim(), repoUrl, rel);
    const compatibility = parseKeyValueTable(readIfExists(join(dir, 'COMPATIBILITY.md')));
    const changelog = parseChangelog(readIfExists(join(dir, 'CHANGELOG.md')));

    for (const r of changelog) {
      const tag = tags.find((t) => t.tag === `${name}--v${r.version}`);
      releases.push({ plugin: name, version: r.version, date: tag?.date ?? r.date, tag: tag?.tag ?? null, notes: r.notes });
    }

    plugins.push({
      name,
      displayName: manifest.displayName ?? null,
      version: manifest.version ?? null,
      description: manifest.description ?? entry.description ?? '',
      category: entry.category ?? null,
      keywords: manifest.keywords ?? [],
      author: manifest.author ?? null,
      license: manifest.license ?? null,
      homepage: manifest.homepage ?? null,
      repository: manifest.repository ?? null,
      dependencies: (manifest.dependencies ?? []).map((d) =>
        typeof d === 'string' ? { name: d.split('@')[0], version: null } : { name: d.name, version: d.version ?? null },
      ),
      compatibility,
      claudeCode: (/[≥>]=?\s*\d+\.\d+\.\d+/.exec(compatibility['Claude Code'] ?? '') ?? [null])[0],
      installCommand: `/plugin install ${name}@${marketplace.name}`,
      source: rel,
      artifacts: pluginArtifacts.map((a) => `${name}:${a.name}`),
      readmePath: bodyFile(name),
      text: readme,
    });
  }

  releases.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.plugin.localeCompare(b.plugin));

  const index = {
    schemaVersion: 1,
    commit: gitCommit(root),
    marketplace: {
      name: marketplace.name,
      description: marketplace.description ?? '',
      owner: marketplace.owner ?? null,
      repository: repoUrl,
      addCommand: `/plugin marketplace add ${repoUrl.replace(/^https:\/\/github\.com\//, '')}`,
    },
    plugins,
    artifacts,
  };
  const stats = {
    plugins: plugins.length,
    skills: artifacts.filter((a) => a.type === 'skill').length,
    agents: artifacts.filter((a) => a.type === 'agent').length,
  };
  return { index, releases, stats, bodies };
}

export function writeIndex(result, outDir) {
  rmSync(join(outDir, 'bodies'), { recursive: true, force: true });
  mkdirSync(join(outDir, 'bodies'), { recursive: true });
  writeFileSync(join(outDir, 'index.json'), JSON.stringify(result.index, null, 2) + '\n');
  writeFileSync(join(outDir, 'releases.json'), JSON.stringify(result.releases, null, 2) + '\n');
  writeFileSync(join(outDir, 'stats.json'), JSON.stringify(result.stats, null, 2) + '\n');
  for (const [path, body] of Object.entries(result.bodies)) writeFileSync(join(outDir, path), body + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--out');
  const outDir = resolve(i === -1 ? join(REPO_ROOT, 'site/public') : process.argv[i + 1]);
  if (existsSync(outDir) && !statSync(outDir).isDirectory()) throw new Error(`${outDir} is not a directory`);
  const result = buildIndex();
  writeIndex(result, outDir);
  console.log(`index: ${result.stats.plugins} plugins, ${result.stats.skills} skills, ${result.stats.agents} agents → ${outDir}`);
}
