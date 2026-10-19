// Case studies. Facts come from each project's README, release metadata, commit history and the
// App Store (checked 18 Oct 2026). `place` is a texel on the Ankara elevation model (800 x 950,
// 40 m per texel): a real hilltop near Kızılay that the route planner treats as the project's
// destination on the map.
import type { Lang } from './site';

// Standard names stay on one line in running text: a word joiner after each hyphen.
const APP6 = 'APP-\u20606';
const STD = 'MIL-\u2060STD-\u20602525';
const SHA = 'SHA-\u2060256';

export type Figure =
  | { kind: 'image'; image: 'volflow' | 'arcade'; tall?: boolean }
  | { kind: 'diagram' }
  | { kind: 'symbols' }
  | { kind: 'tree' }
  | { kind: 'keys' };

export type Copy = {
  what: string;
  summary: string;
  description: string;
  role: string;
  status: string;
  context: string;
  idea: string;
  craft: string[];
  outcome: string;
  alt?: string;
};

export type Project = {
  slug: string;
  title: string;
  year: number;
  /** Where it stands, in a few words: the index's last column. */
  state: Record<Lang, string>;
  place: { x: number; y: number };
  stack: string[];
  figures: (Figure | null)[]; // one per craft line; null = text only
  links: { label: Record<Lang, string>; href: string }[];
  en: Copy;
  tr: Copy;
};

export const projects: Project[] = [
  {
    slug: 'ai-bridge',
    title: 'AI Bridge',
    year: 2026,
    state: { en: 'Shipping, 0.7', tr: 'Yayında, 0.7' },
    place: { x: 426, y: 301 },
    stack: ['Kotlin', 'TypeScript', 'JCEF', 'IntelliJ Platform'],
    figures: [{ kind: 'keys' }, null, null, null],
    links: [
      { label: { en: 'Plugin feed', tr: 'Eklenti beslemesi' }, href: 'https://birkankader.com/plugins/ai-bridge/updatePlugins.xml' },
    ],
    en: {
      what: 'Claude Code inside JetBrains IDEs',
      summary: 'Claude Code inside JetBrains IDEs: conversations, project context and reviewable diffs, without leaving the editor.',
      description: 'AI Bridge brings Claude Code into JetBrains IDEs with project context, native diffs and task queues. It ships from Birkan Kader’s own plugin repository.',
      role: 'Design and code, solo',
      status: '0.7, released 18 Oct 2026',
      context: 'Claude Code lives in a terminal, and I live in IntelliJ. Copying code into a terminal and reading diffs there added up to a lot of switching between windows.',
      idea: 'Keep Claude Code as the engine and give it the IDE as a body. AI Bridge began as a fork of Swttch, an open source plugin under the AGPL. I added what I missed while using it all day: queues, context previews, native diffs, recovery from dropped connections and a Turkish interface.',
      craft: [
        'Alt+K sends the selection or the current file. A preview shows exactly what Claude will read before anything is sent.',
        'Proposed edits open in the IDE’s own diff viewer, so reviewing them uses the shortcuts you already know.',
        'Each project gets a message queue with a concurrency limit, and a panel shows local CPU and memory during long runs.',
        'When a connection drops, the plugin retries on its own and the reply continues where it stopped.',
      ],
      outcome: 'It shipped as Kaşif first, then became AI Bridge with a new plugin ID. Builds 0.1 to 0.7 came out between 16 and 18 October 2026, each with its source ZIP beside it, as the AGPL asks. It installs from my plugin repository on IntelliJ Platform 2023.1 and newer.',
    },
    tr: {
      what: 'JetBrains IDE’lerinde Claude Code',
      summary: 'JetBrains IDE’lerinde Claude Code: sohbetler, proje bağlamı ve incelenebilir değişiklikler, editörden hiç çıkmadan.',
      description: 'AI Bridge, Claude Code’u proje bağlamı, IDE’nin diff görünümü ve görev kuyruklarıyla JetBrains IDE’lerine taşır. Birkan Kader’in eklenti deposundan kurulur.',
      role: 'Tasarım ve kod, tek başıma',
      status: '0.7, 18 Ekim 2026’da yayımlandı',
      context: 'Claude Code bir terminalde çalışıyor; ben ise IntelliJ’den neredeyse hiç çıkmıyorum. Kodu terminale taşımak, değişiklikleri orada okumak derken pencereler arasında epey zaman kaybediyordum.',
      idea: 'Motor olarak Claude Code’u bırakıp ona gövde olarak IDE’yi vermek. AI Bridge, AGPL lisanslı açık kaynak Swttch eklentisinin bir çatalı olarak başladı. Gün boyu kullanırken eksikliğini hissettiklerimi ekledim: kuyruklar, bağlam önizlemesi, IDE’nin kendi diff görünümü, kopan bağlantılardan kurtarma ve Türkçe arayüz.',
      craft: [
        'Alt+K seçili kodu ya da açık dosyayı gönderir. Bir önizleme, Claude’un neyi okuyacağını gönderimden önce tam olarak gösterir.',
        'Önerilen düzenlemeler IDE’nin kendi diff görünümünde açılır; inceleme, zaten bildiğiniz kısayollarla yapılır.',
        'Her projenin eşzamanlılık sınırı olan bir mesaj kuyruğu var; uzun işlerde bir panel yerel işlemci ve bellek kullanımını gösterir.',
        'Bağlantı koptuğunda eklenti kendiliğinden yeniden dener ve yanıt kaldığı yerden devam eder.',
      ],
      outcome: 'Önce Kaşif adıyla yayımlandı, sonra yeni bir eklenti kimliğiyle AI Bridge oldu. 0.1’den 0.7’ye kadarki sürümler 16 ile 18 Ekim 2026 arasında çıktı; AGPL’nin istediği gibi her birinin kaynak ZIP’i yanında duruyor. IntelliJ Platform 2023.1 ve sonrasında, eklenti depomdan kuruluyor.',
    },
  },
  {
    slug: 'whalecode',
    title: 'WhaleCode',
    year: 2026,
    state: { en: 'Archived', tr: 'Arşivlendi' },
    place: { x: 471, y: 470 },
    stack: ['Rust', 'Tauri 2', 'React 19', 'TypeScript', 'SQLite'],
    figures: [{ kind: 'diagram' }, null, null, null],
    links: [{ label: { en: 'Source on GitHub', tr: 'GitHub’da kaynak kod' }, href: 'https://github.com/Birkankader/WhaleCode' }],
    en: {
      what: 'Desktop app that runs a team of AI coding agents',
      summary: 'A desktop app that runs a team of AI coding agents on one repository and draws the whole run as a live graph.',
      description: 'WhaleCode is an open source desktop app that splits a coding task across parallel AI agents in git worktrees and draws the run as a live graph.',
      role: 'Design and code, solo',
      status: 'Open source, MIT. Archived in October 2026',
      context: 'Coding agents are good at one task at a time. Real changes are several tasks, and running three agents by hand means three terminals, three branches and, at the end, a merge nobody planned.',
      idea: 'A master agent splits the task into subtasks. Worker agents run in parallel, each in its own git worktree, and you approve at the moments that matter. There is no sidebar, no tabs and no modal: the execution graph is the interface.',
      craft: [
        'Failures climb a ladder: one retry for the worker, then up to two re-plans by the master, then a human.',
        'Workers never talk to each other. They share notes through one file in the repository, and the master decides.',
        'Claude Code and Codex CLI can lead a run. Gemini CLI works as a worker only, because it plans too slowly.',
        'Any worker can be stopped, undone or asked a question mid-run without stopping the others.',
      ],
      outcome: '335 commits between March and June 2026. Seven phases shipped, each with a written spec, a verification pass and a retrospective in the repository. There will be no eighth: Claude Code, Codex and Cursor now run agents in parallel worktrees themselves.',
    },
    tr: {
      what: 'Bir ekip dolusu yapay zekâ kod ajanını yöneten masaüstü uygulaması',
      summary: 'Tek bir depo üzerinde bir ekip dolusu yapay zekâ kod ajanını çalıştıran ve bütün akışı canlı bir grafik olarak çizen masaüstü uygulaması.',
      description: 'WhaleCode, bir kodlama görevini git worktree’lerinde paralel çalışan yapay zekâ ajanlarına bölen ve akışı canlı bir grafikle gösteren açık kaynak bir uygulama.',
      role: 'Tasarım ve kod, tek başıma',
      status: 'Açık kaynak, MIT. Ekim 2026’da arşivlendi',
      context: 'Kod ajanları tek bir görevde iyiler. Gerçek değişiklikler ise birkaç görevden oluşur; üç ajanı elle çalıştırmak üç terminal, üç dal ve en sonunda kimsenin planlamadığı bir birleştirme demek.',
      idea: 'Bir yönetici ajan görevi alt görevlere böler. İşçi ajanlar her biri kendi git worktree’sinde paralel çalışır, siz de önemli anlarda onay verirsiniz. Kenar çubuğu, sekme ya da açılır pencere yok: arayüzün kendisi yürütme grafiği.',
      craft: [
        'Hatalar bir merdiveni tırmanır: işçiye bir yeniden deneme hakkı, ardından yöneticinin en fazla iki kez yeniden planlaması, en son da bir insan.',
        'İşçiler birbiriyle konuşmaz. Depodaki tek bir dosya üzerinden not paylaşırlar, kararı yönetici verir.',
        'Claude Code ve Codex CLI bir akışı yönetebilir. Gemini CLI planlamada yavaş kaldığı için yalnızca işçi olarak çalışır.',
        'Herhangi bir işçi, diğerlerini durdurmadan akışın ortasında durdurulabilir, geri alınabilir ya da bir soruyla yönlendirilebilir.',
      ],
      outcome: 'Mart ile Haziran 2026 arasında 335 commit. Yedi aşamanın her biri tamamlandı; her birinin yazılı tanımı, doğrulama adımı ve geriye dönük değerlendirmesi depoda duruyor. Sekizinci aşama olmayacak: Claude Code, Codex ve Cursor artık ajanları ayrı worktree’lerde paralel olarak kendileri çalıştırabiliyor.',
    },
  },
  {
    slug: 'tmap-milsymbol',
    title: 'tmap-milsymbol',
    year: 2026,
    state: { en: 'Open source, MIT', tr: 'Açık kaynak, MIT' },
    place: { x: 418, y: 478 },
    stack: ['Java 17', 'Apache Batik', 'Maven'],
    figures: [{ kind: 'symbols' }, null, null, null],
    links: [{ label: { en: 'Source on GitHub', tr: 'GitHub’da kaynak kod' }, href: 'https://github.com/Birkankader/tmap-milsymbol' }],
    en: {
      what: 'Military map symbols for Java',
      summary: `A Java port of milsymbol: NATO ${APP6} and ${STD} military symbols as SVG or images, with no runtime dependencies.`,
      description: 'tmap-milsymbol ports milsymbol to Java 17: NATO APP-6 and MIL-STD-2525 symbols as SVG or images, with over 1,500 icons and every modifier. Open source, MIT.',
      role: 'Port and tooling, solo',
      status: 'Open source, MIT',
      context: 'A military symbol is a small sentence. The frame says friend or hostile, the icon says what the unit is, and modifiers add its size, status and movement. The best open implementation, milsymbol, is written in JavaScript, so desktop map software in Java had to call out to it or draw everything by hand.',
      idea: 'Port it whole, with the same options, so one symbol code gives the same picture in both worlds. The mapping tables live in resource files, and a maintenance tool refreshes them from the upstream project without Node.js.',
      craft: [
        `Letter codes (${APP6} B, ${STD} B and C) and number codes (${APP6} D and E, ${STD} D and E) both work.`,
        'More than 1,500 icons and 1,500 code mappings: ground, air, sea, subsurface, space and more.',
        'Fourteen echelons, thirteen mobility types, condition bars, a direction arrow and over 25 text fields.',
        'A parity report checks every mapping row against the runtime registry, so a missing icon fails the build instead of a map.',
      ],
      outcome: 'Released as open source in April 2026 for Java 17, under the MIT license, like the original by Måns Beckman.',
    },
    tr: {
      what: 'Java için askerî harita sembolleri',
      summary: `milsymbol’ün Java’ya taşınmış hali: NATO ${APP6} ve ${STD} askerî sembolleri SVG ya da görüntü olarak, çalışma zamanı bağımlılığı olmadan.`,
      description: 'tmap-milsymbol, milsymbol’ü Java 17’ye taşıyor: NATO APP-6 ve MIL-STD-2525 sembolleri SVG ya da görüntü olarak, 1.500’den fazla ikonla. Açık kaynak, MIT.',
      role: 'Taşıma ve araçlar, tek başıma',
      status: 'Açık kaynak, MIT',
      context: 'Bir askerî sembol küçük bir cümle gibidir. Çerçeve dost mu düşman mı olduğunu, ikon birliğin ne olduğunu söyler; değiştiriciler büyüklüğü, durumu ve hareketi ekler. Bunun en iyi açık kaynak uygulaması olan milsymbol JavaScript ile yazılmış; Java’daki masaüstü harita yazılımları ya ona dışarıdan çağrı yapmak ya da her şeyi elle çizmek zorundaydı.',
      idea: 'Kütüphaneyi bütünüyle, aynı seçeneklerle taşımak; böylece aynı sembol kodu iki dünyada da aynı resmi verir. Eşleme tabloları kaynak dosyalarında duruyor ve bir bakım aracı onları Node.js gerektirmeden asıl projeden güncelliyor.',
      craft: [
        `Hem harfli kodlar (${APP6} B, ${STD} B ve C) hem sayısal kodlar (${APP6} D ve E, ${STD} D ve E) çalışıyor.`,
        '1.500’den fazla ikon ve 1.500’den fazla kod eşlemesi: kara, hava, deniz, denizaltı, uzay ve dahası.',
        'On dört kademe, on üç hareket tipi, durum çubukları, yön oku ve 25’ten fazla metin alanı.',
        'Bir eşitlik raporu her eşleme satırını çalışma zamanındaki kayıtla karşılaştırır; eksik bir ikon haritada değil, derlemede hata verir.',
      ],
      outcome: 'Nisan 2026’da Java 17 için açık kaynak olarak yayımlandı; Måns Beckman’ın özgün kütüphanesi gibi MIT lisanslı.',
    },
  },
  {
    slug: 'volflow',
    title: 'Volflow',
    year: 2026,
    state: { en: 'App Store, 1.0.9', tr: 'App Store, 1.0.9' },
    place: { x: 309, y: 365 },
    stack: ['Swift', 'SwiftUI', 'WebKit'],
    figures: [{ kind: 'image', image: 'volflow', tall: true }, null, null, null],
    links: [
      { label: { en: 'App Store', tr: 'App Store' }, href: 'https://apps.apple.com/app/id6783449972' },
      { label: { en: 'Website', tr: 'Web sitesi' }, href: 'https://birkankader.github.io/volflow-ios/' },
    ],
    en: {
      what: 'Privacy browser for iPhone and iPad',
      summary: 'A web browser for iPhone and iPad that blocks ads and trackers on the device and locks private mode behind Face ID.',
      description: 'Volflow, a WebKit browser for iPhone and iPad: ad and tracker blocking on the device, a Face ID private mode, no accounts and no analytics.',
      role: 'Design and code, solo',
      status: 'App Store, version 1.0.9',
      context: 'Privacy browsers often make you choose: remember nothing at all, or be tracked. I wanted normal browsing that stays on the phone, and a private mode that is actually locked.',
      idea: 'Volflow opens in normal mode and keeps history, tabs and downloads on the device. Private sessions save nothing and need Face ID, Touch ID or the passcode to open. There are no accounts and no analytics. The only feature that talks to a third party is page translation, and it stays off until you use it.',
      craft: [
        'The first App Store screenshot. Underneath, the app runs on WebKit, the same engine as Safari.',
        'EasyList, EasyPrivacy and Turkish filters add up to more than 110,000 blocking rules, all applied on the device.',
        'Tab groups with search, an offline video player, iPad multi-window and a choice of search engine.',
        'English and Turkish, following the device language.',
      ],
      outcome: 'On the App Store since 25 June 2026, free, now at version 1.0.9. It is one of my three apps there, with Vulfyn and Wildmate.',
      alt: 'App Store screenshot of Volflow: an orange fox logo on dark green, the line “The web, on your terms.” and the start screen of the browser on an iPhone.',
    },
    tr: {
      what: 'iPhone ve iPad için gizlilik odaklı tarayıcı',
      summary: 'Reklamları ve izleyicileri cihazın üzerinde engelleyen, gizli modu Face ID ile kilitleyen bir iPhone ve iPad tarayıcısı.',
      description: 'Volflow, iPhone ve iPad için bir WebKit tarayıcısı: cihaz üzerinde reklam ve izleyici engelleme, Face ID ile kilitli gizli mod. Hesap yok, analiz yok.',
      role: 'Tasarım ve kod, tek başıma',
      status: 'App Store, 1.0.9 sürümü',
      context: 'Gizlilik odaklı tarayıcılar çoğu zaman bir seçim dayatır: ya hiçbir şey hatırlanmaz ya da izlenirsiniz. Ben telefonda kalan normal bir gezinme ve gerçekten kilitli bir gizli mod istedim.',
      idea: 'Volflow normal modda açılır; geçmişi, sekmeleri ve indirilenleri cihazda tutar. Gizli oturumlar hiçbir şey kaydetmez ve açılmak için Face ID, Touch ID ya da cihaz parolası ister. Hesap yok, analiz yok. Üçüncü bir tarafla konuşan tek özellik sayfa çevirisi; o da siz kullanana kadar kapalı kalır.',
      craft: [
        'App Store’daki ilk ekran görüntüsü. Uygulama, Safari ile aynı motor olan WebKit üzerinde çalışıyor.',
        'EasyList, EasyPrivacy ve Türkçe filtreler birlikte 110.000’den fazla engelleme kuralı ediyor; hepsi cihazda uygulanıyor.',
        'Aranabilen sekme grupları, çevrimdışı video oynatıcı, iPad’de çoklu pencere ve arama motoru seçimi.',
        'Cihazın diline göre İngilizce ya da Türkçe.',
      ],
      outcome: '25 Haziran 2026’dan beri App Store’da, ücretsiz; şu an 1.0.9 sürümünde. Vulfyn ve Wildmate ile birlikte oradaki üç uygulamamdan biri.',
      alt: 'Volflow’un App Store ekran görüntüsü: koyu yeşil zemin üzerinde turuncu tilki logosu, “The web, on your terms.” yazısı ve bir iPhone’da tarayıcının açılış ekranı.',
    },
  },
  {
    slug: 'chalknotes',
    title: 'ChalkNotes',
    year: 2026,
    state: { en: 'Released for Windows', tr: 'Windows için yayında' },
    place: { x: 352, y: 294 },
    stack: ['Tauri 2', 'Rust', 'TypeScript', 'SQLite', 'Supabase'],
    figures: [{ kind: 'tree' }, null, null, null, null],
    links: [{ label: { en: 'Releases', tr: 'Sürümler' }, href: 'https://github.com/Birkankader/chalknotes-releases' }],
    en: {
      what: 'Local-first Markdown workspace',
      summary: 'A Markdown workspace for Windows and macOS that keeps your notes as plain files in a folder you own.',
      description: 'ChalkNotes, a local-first Markdown workspace for Windows and macOS, built with Tauri 2 and Rust. Notes stay plain files; sync is optional.',
      role: 'Design and code, solo',
      status: 'Windows releases with automatic updates',
      context: 'Note apps tend to own your notes. Leave one and you export, convert, and lose your links on the way.',
      idea: 'A Shelter is a real folder on disk. Notes are Markdown, canvases are JSON and attachments are ordinary files, all readable without the app. The app only adds an index it can rebuild at any time, and sync is optional.',
      craft: [
        'A Shelter on disk. The SQLite index lives in the app’s data folder, never inside your notes.',
        `Full-text search with SQLite FTS5, a ${SHA} index for attachments and a watcher that notices edits made outside the app.`,
        'Wiki links with aliases and autocomplete, backlinks and a list of broken links.',
        'A graph view, a canvas for cards and arrows with a freehand layer, and mind maps built from headings.',
        'Optional sync through Supabase with row-level security. Without it, every feature works offline.',
      ],
      outcome: 'Windows installers with automatic updates since September 2026, published in a public releases repository. The macOS build is prepared in CI.',
    },
    tr: {
      what: 'Yerel öncelikli Markdown çalışma alanı',
      summary: 'Notlarınızı size ait bir klasörde düz dosyalar olarak tutan, Windows ve macOS için bir Markdown çalışma alanı.',
      description: 'ChalkNotes, Windows ve macOS için yerel öncelikli bir Markdown çalışma alanı. Notlar düz dosya olarak kalır, eşitleme isteğe bağlı.',
      role: 'Tasarım ve kod, tek başıma',
      status: 'Otomatik güncellenen Windows sürümleri',
      context: 'Not uygulamaları notlarınızı sahiplenmeye meyillidir. Birinden ayrılırken dışa aktarır, dönüştürür ve yolda bağlantılarınızı kaybedersiniz.',
      idea: 'Shelter, diskteki gerçek bir klasör. Notlar Markdown, tuvaller JSON, ekler sıradan dosyalar; hepsi uygulama olmadan da okunabilir. Uygulama yalnızca her an yeniden kurabileceği bir dizin ekler; eşitleme isteğe bağlıdır.',
      craft: [
        'Diskteki bir Shelter. SQLite dizini notlarınızın içinde değil, uygulamanın veri klasöründe durur.',
        `SQLite FTS5 ile tam metin arama, ekler için ${SHA} dizini ve uygulama dışında yapılan değişiklikleri fark eden bir dosya izleyici.`,
        'Takma adlı ve otomatik tamamlamalı wiki bağlantıları, geri bağlantılar ve kırık bağlantı listesi.',
        'Grafik görünümü, serbest çizim katmanı olan bir kart ve ok tuvali, başlıklardan oluşan zihin haritaları.',
        'Satır düzeyinde güvenlik kullanan, Supabase üzerinden isteğe bağlı eşitleme. O olmadan da her özellik çevrimdışı çalışır.',
      ],
      outcome: 'Eylül 2026’dan beri otomatik güncellenen Windows kurulum dosyaları, herkese açık bir sürüm deposunda yayımlanıyor. macOS sürümü CI’da hazırlanıyor.',
    },
  },
  {
    slug: 'arcade-machine',
    title: 'Arcade Machine',
    year: 2026,
    state: { en: 'Plugin repository, 0.4.4', tr: 'Eklenti deposunda, 0.4.4' },
    place: { x: 466, y: 326 },
    stack: ['Kotlin', 'Ktor', 'SQLite', 'WebSocket', 'JCEF'],
    figures: [{ kind: 'image', image: 'arcade', tall: true }, null, null, null],
    links: [{ label: { en: 'Plugin feed', tr: 'Eklenti beslemesi' }, href: 'https://birkankader.com/plugins/updatePlugins.xml' }],
    en: {
      what: 'Office games inside JetBrains IDEs',
      summary: 'Office games inside JetBrains IDEs: Turkish Wordle, live drawing rooms and a daily Sudoku, all on one LAN server.',
      description: 'Arcade Machine puts three office games in a JetBrains tool window, backed by one Kotlin and Ktor server on the local network. There is a 2019 IDE edition too.',
      role: 'Design and code, solo',
      status: '0.4.4 in my plugin repository',
      context: 'My team wanted a small daily ritual inside the tool we already keep open all day, running on the office network without depending on an outside service.',
      idea: 'One Kotlin server owns every game’s state in SQLite. The plugin is a tool window with an embedded web interface: HTTP for turns, WebSocket for leaderboards, presence and drawing strokes. The Windows server package bundles Java 21 and a small admin panel, so starting it takes a double click.',
      craft: [
        'Çiz & Bil, the drawing room: alternating drawers, letter hints and timed guesses. The interface is in Turkish, like the office.',
        'Office Wordle: five daily Turkish words, six guesses each, with Turkish casing (i and İ, ı and I) and repeated letters scored correctly.',
        'A 2019 edition with native Swing games for IntelliJ 2019.1 to 2019.3, for the machines that can’t update.',
        'Haftanın Seyirliği, a weekly film and TEDx vote, runs on the same server as a second plugin.',
      ],
      outcome: 'Version 0.4.4 is in my plugin repository, with a portable server package and the weekly film plugin beside it.',
      alt: 'The Çiz & Bil drawing room in Arcade Machine: an ellipse drawn on a white canvas, drawing tools below it and a log of hints and correct guesses in Turkish.',
    },
    tr: {
      what: 'JetBrains IDE’lerinde ofis oyunları',
      summary: 'JetBrains IDE’lerinin içinde ofis oyunları: Türkçe Wordle, canlı çizim odaları ve günlük Sudoku; hepsi tek bir yerel ağ sunucusunda.',
      description: 'Arcade Machine, üç ofis oyununu bir JetBrains araç penceresine taşıyor; arkada yerel ağdaki tek bir Kotlin ve Ktor sunucusu çalışıyor.',
      role: 'Tasarım ve kod, tek başıma',
      status: 'Eklenti depomda 0.4.4',
      context: 'Ekibim, gün boyu açık tuttuğumuz aracın içinde küçük bir günlük ritüel istedi. Dışarıdaki bir servise bağlı kalmadan, ofisin kendi ağında çalışması da şarttı.',
      idea: 'Tüm oyunların durumunu SQLite içinde tek bir Kotlin sunucusu tutuyor. Eklenti, gömülü bir web arayüzü olan bir araç penceresi: hamleler HTTP ile; liderlik tabloları, çevrimiçi durumu ve çizim hareketleri WebSocket ile gidiyor. Windows sunucu paketi Java 21 ve küçük bir yönetim paneliyle geliyor; başlatmak için çift tıklamak yetiyor.',
      craft: [
        'Çiz & Bil odası: sırayla çizenler, harf ipuçları ve süreli tahminler.',
        'Ofis Wordle’ı: her gün beş Türkçe kelime ve her biri için altı tahmin. Büyük küçük harf dönüşümü Türkçe kurallarla yapılıyor (i ve İ, ı ve I), tekrar eden harfler doğru puanlanıyor.',
        'Güncellenemeyen makineler için IntelliJ 2019.1 ile 2019.3 arasında çalışan, oyunları Swing ile yazılmış bir 2019 sürümü.',
        'Haftalık film ve TEDx oylaması Haftanın Seyirliği, ikinci bir eklenti olarak aynı sunucuda çalışıyor.',
      ],
      outcome: '0.4.4 sürümü; taşınabilir sunucu paketi ve haftalık film eklentisiyle birlikte eklenti depomda.',
      alt: 'Arcade Machine’deki Çiz & Bil odası: beyaz tuval üzerine çizilmiş bir elips, altında çizim araçları ve Türkçe ipuçlarıyla doğru tahminlerin listesi.',
    },
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)!;
export const nextProject = (slug: string) => projects[(projects.findIndex((p) => p.slug === slug) + 1) % projects.length];
