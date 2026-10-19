// Build-time view of the JetBrains plugin repository in public/plugins. Each plugin release owns
// public/plugins/<slug>/release.json and updatePlugins.xml; this only reads them for display.
import fs from 'node:fs';
import path from 'node:path';

export type PluginRelease = { id: string; name: string; nameLang?: 'tr'; version: string; sinceBuild: string; feed: string; slug: string };

const ROOT = path.resolve('public/plugins');
// Names the feed spells without Turkish letters. They are Turkish, so they are marked as Turkish on English pages.
const NAMES: Record<string, string> = { 'haftanin-seyirligi': 'Haftanın Seyirliği' };
// IntelliJ Platform build number → marketing version (only the ones in use).
const SINCE: Record<string, string> = { '191': '2019.1', '223': '2022.3', '231': '2023.1', '233': '2023.3', '241': '2024.1', '243': '2024.3' };

export function pluginReleases(): PluginRelease[] {
  const out: PluginRelease[] = [];
  for (const slug of fs.readdirSync(ROOT).sort()) {
    const file = path.join(ROOT, slug, 'release.json');
    if (!fs.existsSync(file)) continue;
    const r = JSON.parse(fs.readFileSync(file, 'utf8'));
    const xml = fs.readFileSync(path.join(ROOT, slug, 'updatePlugins.xml'), 'utf8');
    const name = NAMES[slug] ?? /<name>([^<]+)<\/name>/.exec(xml)?.[1] ?? slug;
    const since = String(r.ideaVersion?.['since-build'] ?? '');
    out.push({ id: r.pluginId, name, nameLang: NAMES[slug] ? 'tr' : undefined, version: r.version, sinceBuild: SINCE[since] ?? since, feed: r.repositoryUrl, slug });
  }
  // AI Bridge first, then by name.
  return out.sort((a, b) => (a.slug === 'ai-bridge' ? -1 : b.slug === 'ai-bridge' ? 1 : a.name.localeCompare(b.name)));
}
