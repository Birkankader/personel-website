// The field log: a weekly commit profile from src/data/github.json (npm run github:sync) and a
// short list of smaller public tools. Descriptions come from each repository's README.
import snapshot from './github.json';
import type { Lang } from './site';

export const github = snapshot;

export const tools: { name: string; href: string; lang: string; text: Record<Lang, string> }[] = [
  {
    name: 'Catcot', href: 'https://github.com/Birkankader/Catcot', lang: 'Python',
    text: { en: 'Semantic code search for Claude Code, as a local MCP server.', tr: 'Claude Code için anlamsal kod araması yapan yerel bir MCP sunucusu.' },
  },
  {
    name: 'gis-demo-helper', href: 'https://github.com/Birkankader/gis-demo-helper', lang: 'TypeScript',
    text: { en: 'Downloads tiles, elevation, satellite and vector data for GIS demos, no API keys needed.', tr: 'GIS demoları için tile, yükseklik, uydu ve vektör verisini API anahtarı olmadan indirir.' },
  },
  {
    name: 'Musicify', href: 'https://github.com/Birkankader/Musicify', lang: 'TypeScript',
    text: { en: 'Moves Spotify playlists and liked songs to Apple Music, matching by ISRC first.', tr: 'Spotify çalma listelerini ve beğenilen şarkıları Apple Music’e taşır; önce ISRC ile eşleştirir.' },
  },
  {
    name: 'Detseasy', href: 'https://github.com/Birkankader/Detseasy', lang: 'JavaScript',
    text: { en: 'Filters and exports Türkiye’s DETSİS register of public institutions, as a desktop app.', tr: 'DETSİS’teki kamu kurumlarını filtreleyip dışa aktaran bir masaüstü uygulaması.' },
  },
  {
    name: 'OpencodeConfigurator', href: 'https://github.com/Birkankader/OpencodeConfigurator', lang: 'JavaScript',
    text: { en: 'Installs opencode and manages its MCP servers, skills and plugins from one screen.', tr: 'opencode’u kurar; MCP sunucularını, skill’leri ve eklentileri tek ekrandan yönetir.' },
  },
  {
    name: 'BlockTheUnwanted', href: 'https://github.com/Birkankader/BlockTheUnwanted', lang: 'JavaScript',
    text: { en: 'A Chrome extension that filters X posts by keyword, including text inside images.', tr: 'X gönderilerini, görsellerdeki yazılar dahil, anahtar kelimeye göre süzen bir Chrome eklentisi.' },
  },
];

// English dates read day first with the chart's three-letter months ("14 Sep 2026"; en-GB would
// write "Sept"). Turkish dates spell the month out.
const enMonth = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const trDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const trMonth = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const formatDate = (iso: string, lang: Lang) => {
  const d = at(iso);
  return lang === 'tr' ? trDate.format(d) : `${d.getUTCDate()} ${enMonth.format(d)} ${d.getUTCFullYear()}`;
};
/** Field log points sit on weekly bins, so they are labelled by month, not by a day they may not match. */
export const formatMonth = (iso: string, lang: Lang) => {
  const d = at(iso);
  return lang === 'tr' ? trMonth.format(d) : `${enMonth.format(d)} ${d.getUTCFullYear()}`;
};
/** Commit messages are written in either language; Turkish ones are marked so they are read as Turkish. */
export const messageLang = (msg: string): Lang =>
  /[ğĞıİşŞ]/.test(msg) || /(^|\s)(ve|ile|için|bayrak|ekle\S*|kaldır\S*|güncelle\S*|düzelt\S*|sürüm\S*|hata\S*)(\s|$)/i.test(msg) ? 'tr' : 'en';

export const formatNumber = (n: number, lang: Lang) => new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US').format(n);
