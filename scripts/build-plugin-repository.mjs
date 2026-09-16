import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import xml2js from 'xml2js';

// Per-plugin release scripts continue owning their own source feeds. Merge them
// after Vite copies public/, so existing release workflows cannot erase peers.
export async function buildRepository(source, output) {
  const plugins = [];
  const feeds = [];
  const ids = new Set();
  for (const entry of (await readdir(source, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const feed = path.join(source, entry.name, 'updatePlugins.xml');
    try { await access(feed); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const parsed = await xml2js.parseStringPromise(await readFile(feed, 'utf8'));
    if (!parsed.plugins?.plugin?.length) throw new Error(`Empty plugin feed: ${feed}`);
    for (const plugin of parsed.plugins.plugin) {
      const { id, version, url } = plugin.$ ?? {};
      if (!id || !version || !url || !plugin['idea-version']?.[0]?.$?.['since-build']) throw new Error(`Incomplete metadata: ${feed}`);
      if (ids.has(id)) throw new Error(`Duplicate plugin ID: ${id}`);
      const download = new URL(url);
      if (download.origin !== 'https://birkankader.com' || !download.pathname.startsWith('/plugins/')) throw new Error(`Unexpected download URL: ${url}`);
      const artifact = path.resolve(source, decodeURIComponent(download.pathname.slice('/plugins/'.length)));
      if (!artifact.startsWith(path.resolve(source) + path.sep)) throw new Error(`Invalid artifact path: ${url}`);
      await access(artifact);
      ids.add(id);
      plugins.push(plugin);
    }
    feeds.push(entry.name);
  }
  if (!plugins.length) throw new Error('No plugins found');
  const xml = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } }).buildObject({ plugins: { plugin: plugins } }) + '\n';
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'updatePlugins.xml'), xml);
  // All previously registered per-plugin URLs remain valid aliases.
  for (const name of feeds) {
    await mkdir(path.join(output, name), { recursive: true });
    await writeFile(path.join(output, name, 'updatePlugins.xml'), xml);
  }
  return plugins.map(plugin => `${plugin.$.id}@${plugin.$.version}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Plugin repository:', (await buildRepository('public/plugins', 'dist/plugins')).join(', '));
}
