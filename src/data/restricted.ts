// Private repositories, described without code. The count of owned private repositories comes from
// the GitHub snapshot (npm run github:sync; 22 on 18 Oct 2026). Eight are described below in seven
// zones, in the order the section places them; the rest are counted only. Never add internals,
// client names or anything that came from the day job.
import type { Lang } from './site';
import { github } from './github';

export type Zone = {
  name: string;
  repos: number;
  stack: string;
  last: string; // ISO date of the last commit on the default branch
  size: 'l' | 'm' | 's';
  text: Record<Lang, string>;
  status: Record<Lang, string>;
};

export const privateTotal = github.repos.private;

export const zones: Zone[] = [
  {
    name: 'AI Bridge', repos: 2, stack: 'Kotlin, TypeScript, JCEF', last: '2026-10-18', size: 'l',
    text: {
      en: 'Source of the JetBrains plugin further down this page, and of Kaşif, the earlier line it grew out of.',
      tr: 'Bu sayfanın aşağısındaki JetBrains eklentisinin ve onun öncülü Kaşif’in kaynak kodu.',
    },
    status: { en: 'Shipping, 0.7', tr: 'Yayında, 0.7' },
  },
  {
    name: 'Volflow', repos: 1, stack: 'Swift, SwiftUI, WebKit', last: '2026-09-08', size: 'm',
    text: { en: 'Privacy browser for iPhone and iPad.', tr: 'iPhone ve iPad için gizlilik odaklı tarayıcı.' },
    status: { en: 'App Store, 1.0.9', tr: 'App Store, 1.0.9' },
  },
  {
    name: 'Arcade Machine', repos: 1, stack: 'Kotlin, Ktor, SQLite', last: '2026-09-17', size: 'm',
    text: { en: 'Office games in the IDE and the LAN server they share.', tr: 'IDE içinde ofis oyunları ve hepsinin bağlandığı yerel ağ sunucusu.' },
    status: { en: 'Plugin repository, 0.4.4', tr: 'Eklenti deposunda, 0.4.4' },
  },
  {
    name: 'Vulfyn', repos: 1, stack: 'SwiftUI, SwiftData, CloudKit', last: '2026-08-01', size: 'l',
    text: {
      en: 'Personal finance for iOS: accounts, cards, loans and goals, a safe-to-spend figure and debt payoff plans, synced through iCloud.',
      tr: 'iOS için kişisel finans: hesaplar, kartlar, krediler ve hedefler; güvenle harcanabilecek tutar ve borç kapatma planları. Veriler iCloud ile eşitlenir.',
    },
    status: { en: 'App Store, 1.1', tr: 'App Store, 1.1' },
  },
  {
    name: 'ChalkNotes', repos: 1, stack: 'Tauri 2, Rust, TypeScript', last: '2026-09-04', size: 's',
    text: { en: 'Markdown notes kept as plain files in a folder you own.', tr: 'Notları size ait bir klasörde düz dosyalar olarak tutan Markdown çalışma alanı.' },
    status: { en: 'Released for Windows', tr: 'Windows için yayında' },
  },
  {
    name: 'Whence', repos: 1, stack: 'Swift 6, SceneKit, MapKit, Supabase', last: '2026-05-30', size: 's',
    text: {
      en: 'A game: guess where and when a 360° historical scene took place, from 3000 BCE to today.',
      tr: 'Bir oyun: 360° bir tarihi sahnenin nerede ve ne zaman geçtiğini tahmin edin. MÖ 3000’den bugüne.',
    },
    status: { en: 'In development', tr: 'Geliştiriliyor' },
  },
  {
    name: 'FaturaM', repos: 1, stack: 'React Native, FastAPI, Tesseract', last: '2026-04-19', size: 's',
    text: {
      en: 'Photograph a receipt; OCR and your own rules turn it into a budget entry.',
      tr: 'Fişin fotoğrafını çekin; OCR ve sizin kurallarınız onu bir bütçe kaydına çevirsin.',
    },
    status: { en: 'Paused', tr: 'Beklemede' },
  },
];

export const describedRepos = zones.reduce((n, z) => n + z.repos, 0);
export const hatchedRepos = privateTotal - describedRepos;
