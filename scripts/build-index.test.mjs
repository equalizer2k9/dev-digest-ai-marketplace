import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildIndex, writeIndex, parseFrontmatter, absolutizeLinks } from './build-index.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
const manifestOf = (source) => JSON.parse(readFileSync(join(root, source, '.claude-plugin/plugin.json'), 'utf8'));
const { index, releases, stats, bodies } = buildIndex({ root });

test('indexes every plugin of marketplace.json', () => {
  assert.equal(index.plugins.length, marketplace.plugins.length);
  assert.equal(stats.plugins, marketplace.plugins.length);
  assert.deepEqual(index.plugins.map((p) => p.name), marketplace.plugins.map((p) => p.name));
});

test('version and dependencies match each plugin.json', () => {
  for (const entry of marketplace.plugins) {
    const manifest = manifestOf(entry.source);
    const plugin = index.plugins.find((p) => p.name === manifest.name);
    assert.equal(plugin.version, manifest.version, `${manifest.name} version`);
    assert.deepEqual(
      plugin.dependencies,
      (manifest.dependencies ?? []).map((d) => ({ name: d.name, version: d.version ?? null })),
      `${manifest.name} dependencies`,
    );
  }
});

test('artifacts get a namespaced id <plugin>:<name> and a type', () => {
  const spec = index.artifacts.find((a) => a.id === 'sdd-engineering:spec-creator');
  assert.equal(spec?.type, 'agent');
  assert.equal(spec.plugin, 'sdd-engineering');
  assert.equal(index.artifacts.find((a) => a.id === 'engineering-paved-path:zod')?.type, 'skill');
  for (const a of index.artifacts) assert.equal(a.id, `${a.plugin}:${a.name}`);
  for (const p of index.plugins) for (const id of p.artifacts) assert.ok(id.startsWith(`${p.name}:`), id);
});

test('counts match the files on disk', () => {
  let skills = 0;
  let agents = 0;
  for (const entry of marketplace.plugins) {
    const dir = join(root, entry.source);
    if (existsSync(join(dir, 'skills'))) skills += readdirSync(join(dir, 'skills')).filter((s) => existsSync(join(dir, 'skills', s, 'SKILL.md'))).length;
    if (existsSync(join(dir, 'agents'))) agents += readdirSync(join(dir, 'agents')).filter((f) => f.endsWith('.md')).length;
  }
  assert.equal(stats.skills, skills);
  assert.equal(stats.agents, agents);
});

test('every plugin has a release from its CHANGELOG', () => {
  for (const p of index.plugins) assert.ok(releases.some((r) => r.plugin === p.name && r.version === p.version), p.name);
});

test('writes index, releases, stats and one body per plugin and artifact', () => {
  const out = mkdtempSync(join(tmpdir(), 'catalog-'));
  try {
    writeIndex({ index, releases, stats, bodies }, out);
    for (const f of ['index.json', 'releases.json', 'stats.json']) assert.ok(existsSync(join(out, f)), f);
    for (const p of index.plugins) assert.ok(existsSync(join(out, p.readmePath)), p.readmePath);
    for (const a of index.artifacts) {
      const body = readFileSync(join(out, a.bodyPath), 'utf8');
      assert.ok(!body.startsWith('---'), `${a.id} body still has frontmatter`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('parseFrontmatter reads quoted, boolean and list values', () => {
  const { data, body } = parseFrontmatter('---\nname: x\ndescription: "a: b"\ndisable-model-invocation: true\ntools: Read, Grep\n---\nBody');
  assert.deepEqual(data, { name: 'x', description: 'a: b', 'disable-model-invocation': true, tools: 'Read, Grep' });
  assert.equal(body, 'Body');
});

test('absolutizeLinks rewrites relative links outside code fences only', () => {
  const md = '[a](CHANGELOG.md) [b](../../docs/RELEASES.md) [c](https://x.y) [d](#top)\n```\n[e](f.md)\n```';
  const out = absolutizeLinks(md, 'https://github.com/o/r', 'plugins/p');
  assert.match(out, /\[a\]\(https:\/\/github\.com\/o\/r\/blob\/main\/plugins\/p\/CHANGELOG\.md\)/);
  assert.match(out, /\[b\]\(https:\/\/github\.com\/o\/r\/blob\/main\/docs\/RELEASES\.md\)/);
  assert.match(out, /\[c\]\(https:\/\/x\.y\) \[d\]\(#top\)/);
  assert.match(out, /\[e\]\(f\.md\)/);
});
