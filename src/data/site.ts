// Every visible string on the site, written separately in English and Turkish (not translated
// word for word). Rules: no em or en dashes, sentence case, numbers only when true.
// Facts and sources:
//   Career: HAVELSAN intern Jun to Sep 2019, candidate engineer Dec 2019 to Dec 2020, software
//   engineer since Dec 2020 (from the previous version of this site). The 50%, 20% and Java 8 to 11
//   figures are Birkan's own, carried over from that site.
//   App Store: Volflow (released 25 Jun 2026, 1.0.9), Vulfyn (23 Jun 2026, 1.1), Wildmate
//   (2 Jun 2026, 1.2.1), checked with the iTunes lookup API on 18 Oct 2026.
//   GitHub numbers come from src/data/github.json (npm run github:sync).

export type Lang = 'en' | 'tr';
export const langs: Lang[] = ['en', 'tr'];

export const site = {
  name: 'Birkan Kader',
  legalName: 'Sifa Birkan Kader',
  url: 'https://birkankader.com',
  email: 'birkankader@gmail.com',
  github: 'https://github.com/Birkankader',
  socials: [
    { label: 'GitHub', href: 'https://github.com/Birkankader' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/birkankader' },
    { label: 'X', href: 'https://x.com/birkankader' },
  ],
  pluginRepo: 'https://birkankader.com/plugins/updatePlugins.xml',
  apps: [
    { name: 'Volflow', what: { en: 'Privacy browser', tr: 'Gizlilik odaklı tarayıcı' }, version: '1.0.9', href: 'https://apps.apple.com/app/id6783449972' },
    { name: 'Vulfyn', what: { en: 'Personal finance', tr: 'Kişisel finans' }, version: '1.1', href: 'https://apps.apple.com/app/id6782674318' },
    { name: 'Wildmate', what: { en: 'Chess with a card deck', tr: 'Kart destesiyle satranç' }, version: '1.2.1', href: 'https://apps.apple.com/app/id6770251337' },
  ],
};

/** Path in the given language. Paths are written with trailing slashes. */
export const localize = (lang: Lang, path: string) => (lang === 'tr' ? `/tr${path === '/' ? '/' : path}` : path);
/** The same page in the other language. */
export const otherLangPath = (pathname: string) => {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return p === '/tr/' ? '/' : p.startsWith('/tr/') ? p.slice(3) : `/tr${p}`;
};
/** Labels are set in capitals, and Turkish capitalises i as İ. English names inside a Turkish label
 *  keep their own capitals (JETBRAINS EKLENTİLERİ, not JETBRAİNS): those runs are marked English. */
const LATIN = /(JetBrains|GitHub|IntelliJ|LinkedIn|commit)/;
export const capsRuns = (text: string) =>
  text.split(LATIN).map((run, i) => ({ run, en: i % 2 === 1 })).filter((r) => r.run);

export const ui = {
  en: {
    locale: 'en_US',
    htmlLang: 'en',
    skip: 'Skip to content',
    nav: { label: 'Main', work: 'Work', about: 'About', contact: 'Contact' },
    langSwitch: { short: 'TR', label: 'Türkçe' },
    home: 'Home',
    routingTo: 'Routing to',
    loader: { label: 'Loading the terrain', terrain: 'Water level', place: '39.92 N 32.85 E' },
    status: {
      lat: 'LAT', lon: 'LON', elev: 'ELEV', slope: 'SLOPE', route: 'ROUTE', climb: 'CLIMB', foot: 'ON FOOT', nodes: 'NODES',
      searching: 'SEARCHING', none: 'NO ROUTE', scale: 'Scale bar',
    },
    map: {
      origin: 'KIZILAY',
      described: "Behind this page: Ankara's terrain drawn as contour lines from SRTM elevation data. A route planner draws a path from Kızılay to the place you point at, weighing every slope on the way.",
    },
    meta: {
      title: 'Birkan Kader, software engineer',
      description: 'Birkan Kader builds map software for defense systems at HAVELSAN in Ankara, and ships iOS apps, JetBrains plugins and AI developer tools after hours.',
    },
    hero: {
      kicker: 'Software engineer, Ankara',
      statement: 'I build map software for defense systems. After hours, I ship apps and developer tools.',
      captionStart: 'Kader is Turkish for fate. This route is not left to it: an A* search over Ankara’s real elevation plans it slope by slope,',
      captionFine: 'toward your pointer.',
      captionTouch: 'toward wherever you tap.',
      captionStill: 'toward wherever you click.',
      scroll: 'Selected work below',
    },
    work: {
      title: 'Selected work',
      count: 'Six projects, 2026',
      cols: { project: 'Project', what: 'What it is', stack: 'Built with', state: 'Status' },
      open: 'Open case study',
    },
    job: {
      title: 'The day job: maps for defense systems',
      body: [
        'I joined HAVELSAN in 2019 as an intern and have been a software engineer there since December 2020. I work on desktop GIS in Java and OpenGL and on web maps in React and CesiumJS: route planning with A* and slope analysis, elevation tools, tactical graphics and NATO symbology.',
        'I can’t show that code. The route behind this page is how I show the craft instead.',
      ],
      figures: [
        { value: '50%', label: 'faster rendering of tactical graphics' },
        { value: '20%', label: 'less load time for map analysis' },
        { value: 'Java 8 → 11', label: 'a migration I led, Swing and JavaFX included' },
      ],
      roles: [
        { date: 'Jun 2019', role: 'Intern' },
        { date: 'Dec 2019', role: 'Candidate engineer' },
        { date: 'Dec 2020', role: 'Software engineer' },
        { date: 'Today', role: 'Still mapping' },
      ],
      more: 'More about me',
    },
    log: {
      title: 'Field log',
      lead: (total: string) => `${total} commits in the last twelve months, drawn as an elevation profile. Solid ground is public, hatched ground is private. The numbered points are what I was building.`,
      chartLabel: 'Commits per week over the last twelve months, public and private',
      caption: (date: string) => `Commits on default branches, per week. GitHub API, ${date}.`,
      peak: 'busiest week',
      points: [
        { week: '2026-03-01', text: 'WhaleCode starts. 335 commits by June.' },
        { week: '2026-04-05', text: 'tmap-milsymbol, milsymbol ported to Java.' },
        { week: '2026-05-17', text: 'Whence, a history guessing game for iOS.' },
        { week: '2026-06-21', text: 'Volflow and Vulfyn go live on the App Store.' },
        { week: '2026-08-23', text: 'ChalkNotes, a local-first notes app.' },
        { week: '2026-09-13', text: 'Arcade Machine 0.1 for the office.' },
        { week: '2026-10-11', text: 'AI Bridge, from 0.1 to 0.7 in three days.' },
      ],
      recentTitle: 'Latest public commits, as I wrote them',
      alsoTitle: 'Also on GitHub',
      profile: 'Everything on GitHub',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    restricted: {
      title: 'Restricted area',
      lead: (priv: number, total: number) => `${priv} of my ${total} repositories are private. This is what they hold, without the code.`,
      repos: (n: number) => (n === 1 ? '1 repository' : `${n} repositories`),
      last: 'Last commit',
      status: 'Status',
      stack: 'Stack',
      hatched: (n: number) => `${n} more stay hatched: projects still in progress, old coursework and experiments.`,
      zone: 'RESTRICTED',
    },
    plugins: {
      title: 'Plugin repository',
      body: 'Three of my JetBrains plugins install from my own repository. Add the address once under Settings, Plugins, the gear icon, Manage Plugin Repositories. New versions then arrive like any other plugin update.',
      copy: 'Copy address',
      copied: 'Copied',
      requires: 'IntelliJ Platform',
      items: {
        'com.birkankader.ai-bridge': 'Claude Code inside the IDE: chat, context and reviewable diffs.',
        'dev.arcademachine': 'Daily office games on a shared LAN server.',
        'dev.teamwatch.weekly': 'A weekly film and TEDx vote for teams, on the Arcade Machine server.',
      } as Record<string, string>,
    },
    footer: {
      cta: 'Email me',
      elsewhere: 'Elsewhere',
      here: 'This site',
      colophon: 'Terrain: SRTM elevation through Mapzen Terrain Tiles on AWS Open Data. Type: Archivo and JetBrains Mono. Built with Astro, GSAP and OGL.',
      rights: 'Birkan Kader',
      top: 'Back to top',
    },
    about: {
      metaTitle: 'About',
      description: 'Software engineer at HAVELSAN since 2019: desktop GIS in Java and OpenGL, web maps in React and CesiumJS, route planning and military symbology.',
      title: 'Mostly maps.',
      kicker: 'About Birkan Kader',
      portraitAlt: 'Birkan Kader in a red hoodie, smiling, in an office.',
      portraitCaption: 'My GitHub photo, traced as contour lines at twelve brightness levels.',
      showPhoto: 'Show the photo',
      showLines: 'Show the contours',
      bio: [
        'I’m Birkan Kader (Sifa Birkan Kader on paper), a software engineer in Ankara. Since 2019 I have been at HAVELSAN, building map software for defense systems: desktop GIS in Java and OpenGL, web maps in React and CesiumJS, route planning, terrain analysis and military symbology.',
        'Outside work I build the tools I want to use: three iOS apps on the App Store, three JetBrains plugins in my own repository, a desktop notes app and a handful of AI developer tools. I like work you can measure. A shorter route, a frame that draws faster, a plugin a colleague installs on a Monday morning.',
        'Off screen: art books and specialty coffee.',
      ],
      careerTitle: 'Career',
      career: [
        {
          role: 'Software engineer', org: 'HAVELSAN, Ankara', dates: 'Dec 2020 to today',
          points: [
            'Desktop GIS in Java and OpenGL.',
            'Led the move from Java 8 to Java 11 and brought JavaFX components into a Swing interface.',
            'Built route planning with A* and slope analysis on elevation data.',
            'Made tactical graphics render 50% faster and sped up the elevation analysis tools.',
          ],
        },
        {
          role: 'Candidate engineer', org: 'HAVELSAN, Ankara', dates: 'Dec 2019 to Dec 2020',
          points: [
            'New map components in React and CesiumJS.',
            'Map analysis features and their reporting screens.',
            'Cut the load time of map analysis by 20%.',
          ],
        },
        {
          role: 'Intern', org: 'HAVELSAN, Ankara', dates: 'Jun to Sep 2019',
          points: [
            'Drew NATO symbology as SVG and fixed how the Java pipeline rendered it.',
            'Added support for complex path elements to an in-house SVG parser.',
            'Contributed to a description language for tactical graphics.',
          ],
        },
      ],
      toolsTitle: 'Tools',
      tools: [
        { where: 'At work', list: 'Java, OpenGL, Swing, JavaFX, React, CesiumJS, PostGIS, REST services' },
        { where: 'On my own', list: 'Swift and SwiftUI, Kotlin and the IntelliJ Platform, Rust and Tauri, TypeScript, Python' },
        { where: 'Every day', list: 'Git, Docker, Claude Code, a terminal I keep open all day' },
      ],
      shippedTitle: 'Shipped',
      shipped: {
        store: 'App Store',
        plugins: 'JetBrains plugins',
        desktop: 'Desktop',
        open: 'Open source',
      },
    },
    contact: {
      metaTitle: 'Contact',
      description: 'Write to Birkan Kader about map software, JetBrains plugins, iOS apps or a role. Email birkankader@gmail.com or use the form on this page.',
      title: 'Email me',
      lead: 'Map software, a plugin that misbehaves, one of my apps, or a role: write to me directly or use the form. Replies come from this address.',
      form: {
        title: 'Or use the form',
        name: 'Your name',
        email: 'Your email',
        subject: 'Subject',
        message: 'Message',
        send: 'Send message',
        sending: 'Sending',
        sent: 'Sent. Thank you, I’ll reply from birkankader@gmail.com.',
        failed: 'That didn’t go through. Please write to birkankader@gmail.com directly.',
        required: 'Required',
      },
      elsewhere: 'Elsewhere',
      location: 'Ankara, Türkiye. Time zone UTC+3.',
    },
    case: {
      back: 'All work',
      sections: { context: 'The problem', idea: 'The idea', craft: 'Details', outcome: 'Where it stands' },
      meta: { year: 'Year', role: 'Role', stack: 'Stack', status: 'Status', links: 'Links' },
      next: 'Next project',
      index: (i: number, n: number) => `${String(i).padStart(2, '0')} of ${String(n).padStart(2, '0')}`,
    },
    notFound: {
      metaTitle: 'No route found',
      title: 'No route found',
      body: 'The search covered the whole map and found no way to this address. The page may have moved.',
      home: 'Back to the start',
      work: 'See the work',
    },
  },
  tr: {
    locale: 'tr_TR',
    htmlLang: 'tr',
    skip: 'İçeriğe geç',
    nav: { label: 'Ana menü', work: 'İşler', about: 'Hakkımda', contact: 'İletişim' },
    langSwitch: { short: 'EN', label: 'English' },
    home: 'Ana sayfa',
    routingTo: 'Rota:',
    loader: { label: 'Arazi yükleniyor', terrain: 'Su seviyesi', place: '39,92 K 32,85 D' },
    status: {
      lat: 'ENLEM', lon: 'BOYLAM', elev: 'RAKIM', slope: 'EĞİM', route: 'ROTA', climb: 'TIRMANIŞ', foot: 'YAYAN', nodes: 'DÜĞÜM',
      searching: 'ARANIYOR', none: 'ROTA YOK', scale: 'Ölçek çubuğu',
    },
    map: {
      origin: 'KIZILAY',
      described: 'Bu sayfanın arkasında, SRTM yükseklik verisinden çizilmiş eş yükselti eğrileriyle Ankara’nın arazisi var. Bir rota planlayıcı, yoldaki her eğimi tartarak Kızılay’dan gösterdiğiniz yere bir yol çiziyor.',
    },
    meta: {
      title: 'Birkan Kader, yazılım mühendisi',
      description: 'Birkan Kader, Ankara’da HAVELSAN’da savunma sistemleri için harita yazılımı geliştiriyor; mesai dışında iOS uygulamaları ve geliştirici araçları yayınlıyor.',
    },
    hero: {
      kicker: 'Yazılım mühendisi, Ankara',
      statement: 'Savunma sistemleri için harita yazılımı geliştiriyorum. Mesai dışında uygulamalar ve geliştirici araçları yayınlıyorum.',
      captionStart: 'Soyadım Kader. Bu rota ise kadere kalmadı: Ankara’nın gerçek yükseklik verisi üzerinde çalışan bir A* araması, eğimleri tek tek tartarak onu',
      captionFine: 'imlecinizin olduğu yere çiziyor.',
      captionTouch: 'dokunduğunuz yere çiziyor.',
      captionStill: 'tıkladığınız yere çiziyor.',
      scroll: 'Seçili işler aşağıda',
    },
    work: {
      title: 'Seçili işler',
      count: '2026’dan altı proje',
      cols: { project: 'Proje', what: 'Ne işe yarar', stack: 'Teknoloji', state: 'Durum' },
      open: 'Proje sayfasını aç',
    },
    job: {
      title: 'Asıl işim: savunma sistemleri için haritalar',
      body: [
        'HAVELSAN’a 2019’da stajyer olarak girdim, Aralık 2020’den beri orada yazılım mühendisiyim. Java ve OpenGL ile masaüstü CBS, React ve CesiumJS ile web haritaları üzerinde çalışıyorum: A* ve eğim analiziyle rota planlama, yükseklik araçları, taktik grafikler ve NATO sembolojisi.',
        'O kodu gösteremem. Onun yerine işimi bu sayfanın arkasındaki rotayla gösteriyorum.',
      ],
      figures: [
        { value: '%50', label: 'daha hızlı çizilen taktik grafikler' },
        { value: '%20', label: 'daha kısa harita analizi yükleme süresi' },
        { value: 'Java 8 → 11', label: 'Swing ve JavaFX’i de kapsayan, yönettiğim geçiş' },
      ],
      roles: [
        { date: 'Haz 2019', role: 'Stajyer' },
        { date: 'Ara 2019', role: 'Aday mühendis' },
        { date: 'Ara 2020', role: 'Yazılım mühendisi' },
        { date: 'Bugün', role: 'Hâlâ harita çiziyorum' },
      ],
      more: 'Hakkımda daha fazlası',
    },
    log: {
      title: 'Saha defteri',
      lead: (total: string) => `Son on iki aydaki ${total} commit, bir yükseklik profili olarak çizildi. Düz dolgu açık depoları, taralı alan gizli depoları gösteriyor. Numaralı noktalar, o sırada üzerinde çalıştığım işler.`,
      chartLabel: 'Son on iki ayda haftalık commit sayısı, açık ve gizli depolar',
      caption: (date: string) => `Varsayılan dallardaki commit’ler, haftalık. Kaynak GitHub API, ${date}.`,
      peak: 'en yoğun hafta',
      points: [
        { week: '2026-03-01', text: 'WhaleCode başlıyor; hazirana kadar 335 commit.' },
        { week: '2026-04-05', text: 'tmap-milsymbol: milsymbol’ün Java’ya taşınması.' },
        { week: '2026-05-17', text: 'Whence: iOS için bir tarih tahmin oyunu.' },
        { week: '2026-06-21', text: 'Volflow ve Vulfyn App Store’da yayında.' },
        { week: '2026-08-23', text: 'ChalkNotes: yerel öncelikli bir not uygulaması.' },
        { week: '2026-09-13', text: 'Ofis için Arcade Machine 0.1.' },
        { week: '2026-10-11', text: 'AI Bridge üç günde 0.1’den 0.7’ye.' },
      ],
      recentTitle: 'Son açık commit’ler, yazdığım gibi',
      alsoTitle: 'GitHub’da ayrıca',
      profile: 'GitHub’daki her şey',
      months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    },
    restricted: {
      title: 'Kısıtlı alan',
      lead: (priv: number, total: number) => `${total} depomun ${priv} tanesi gizli. Kodlarını açmadan, içlerinde ne olduğunu anlatıyorum.`,
      repos: (n: number) => `${n} depo`,
      last: 'Son commit',
      status: 'Durum',
      stack: 'Teknoloji',
      hatched: (n: number) => `${n} depo daha taralı kalıyor: süren projeler, eski okul ödevleri ve denemeler.`,
      zone: 'KISITLI',
    },
    plugins: {
      title: 'Eklenti deposu',
      body: 'Üç JetBrains eklentim kendi depomdan kuruluyor. Adresi bir kez Settings, Plugins, dişli simgesi, Manage Plugin Repositories yolundan ekleyin. Yeni sürümler, diğer eklenti güncellemeleri gibi gelir.',
      copy: 'Adresi kopyala',
      copied: 'Kopyalandı',
      requires: 'IntelliJ Platform',
      items: {
        'com.birkankader.ai-bridge': 'Claude Code’u IDE’nin içine taşır: sohbet, bağlam ve incelenebilir değişiklikler.',
        'dev.arcademachine': 'Ortak bir yerel ağ sunucusunda günlük ofis oyunları.',
        'dev.teamwatch.weekly': 'Ekipler için haftalık film ve TEDx oylaması; Arcade Machine sunucusunda çalışır.',
      } as Record<string, string>,
    },
    footer: {
      cta: 'Bana yazın',
      elsewhere: 'Diğer adresler',
      here: 'Bu site',
      colophon: 'Arazi: AWS Open Data üzerindeki Mapzen Terrain Tiles’tan SRTM yükseklik verisi. Yazı tipleri: Archivo ve JetBrains Mono. Astro, GSAP ve OGL ile yapıldı.',
      rights: 'Birkan Kader',
      top: 'Başa dön',
    },
    about: {
      metaTitle: 'Hakkımda',
      description: '2019’dan beri HAVELSAN’da yazılım mühendisi: Java ve OpenGL ile masaüstü CBS, React ve CesiumJS ile web haritaları, rota planlama ve askerî semboloji.',
      title: 'Çoğunlukla haritalar.',
      kicker: 'Birkan Kader hakkında',
      portraitAlt: 'Kırmızı kapüşonlu giymiş Birkan Kader, bir ofiste gülümsüyor.',
      portraitCaption: 'GitHub fotoğrafım, on iki parlaklık seviyesinde eş yükselti eğrisi olarak çizildi.',
      showPhoto: 'Fotoğrafı göster',
      showLines: 'Eğrileri göster',
      bio: [
        'Ben Birkan Kader (resmî kayıtlarda Sifa Birkan Kader), Ankara’da yazılım mühendisiyim. 2019’dan beri HAVELSAN’dayım ve savunma sistemleri için harita yazılımı geliştiriyorum: Java ve OpenGL ile masaüstü CBS, React ve CesiumJS ile web haritaları, rota planlama, arazi analizi ve askerî semboloji.',
        'İş dışında kendi kullanmak istediğim araçları yapıyorum: App Store’da üç iOS uygulaması, kendi depomda üç JetBrains eklentisi, bir masaüstü not uygulaması ve bir avuç yapay zekâ geliştirici aracı. Sonucu ölçülebilen işleri seviyorum. Daha kısa bir rota, daha hızlı çizilen bir kare, bir iş arkadaşımın pazartesi sabahı kurduğu bir eklenti.',
        'Ekran dışında: sanat kitapları ve nitelikli kahve.',
      ],
      careerTitle: 'Kariyer',
      career: [
        {
          role: 'Yazılım mühendisi', org: 'HAVELSAN, Ankara', dates: 'Aralık 2020’den beri',
          points: [
            'Java ve OpenGL ile masaüstü CBS.',
            'Java 8’den Java 11’e geçişi yönettim, Swing arayüzüne JavaFX bileşenleri ekledim.',
            'Yükseklik verisi üzerinde A* ve eğim analiziyle rota planlamayı geliştirdim.',
            'Taktik grafiklerin çizimini %50 hızlandırdım, yükseklik analizi araçlarının performansını artırdım.',
          ],
        },
        {
          role: 'Aday mühendis', org: 'HAVELSAN, Ankara', dates: 'Aralık 2019 ile Aralık 2020 arası',
          points: [
            'React ve CesiumJS ile yeni harita bileşenleri.',
            'Harita analizi özellikleri ve bunların rapor ekranları.',
            'Harita analizinin yükleme süresini %20 kısalttım.',
          ],
        },
        {
          role: 'Stajyer', org: 'HAVELSAN, Ankara', dates: 'Haziran ile Eylül 2019 arası',
          points: [
            'NATO sembollerini SVG olarak çizdim ve Java tarafındaki çizim hatalarını düzelttim.',
            'Şirket içi SVG ayrıştırıcısına karmaşık path öğeleri desteği ekledim.',
            'Taktik grafikler için bir tanımlama dilinin geliştirilmesine katkıda bulundum.',
          ],
        },
      ],
      toolsTitle: 'Araçlar',
      tools: [
        { where: 'İşte', list: 'Java, OpenGL, Swing, JavaFX, React, CesiumJS, PostGIS, REST servisleri' },
        { where: 'Kendi projelerimde', list: 'Swift ve SwiftUI, Kotlin ve IntelliJ Platform, Rust ve Tauri, TypeScript, Python' },
        { where: 'Her gün', list: 'Git, Docker, Claude Code ve gün boyu açık duran bir terminal' },
      ],
      shippedTitle: 'Yayında olanlar',
      shipped: {
        store: 'App Store',
        plugins: 'JetBrains eklentileri',
        desktop: 'Masaüstü',
        open: 'Açık kaynak',
      },
    },
    contact: {
      metaTitle: 'İletişim',
      description: 'Harita yazılımı, JetBrains eklentileri, iOS uygulamaları ya da bir iş için Birkan Kader’e yazın: birkankader@gmail.com adresi veya bu sayfadaki form.',
      title: 'Bana yazın',
      lead: 'Harita yazılımı, sorun çıkaran bir eklenti, uygulamalarımdan biri ya da bir iş teklifi: doğrudan yazın veya formu kullanın. Yanıtlar bu adresten gelir.',
      form: {
        title: 'Ya da formu kullanın',
        name: 'Adınız',
        email: 'E-posta adresiniz',
        subject: 'Konu',
        message: 'Mesajınız',
        send: 'Mesajı gönder',
        sending: 'Gönderiliyor',
        sent: 'Gönderildi. Teşekkürler, birkankader@gmail.com adresinden yanıt vereceğim.',
        failed: 'Mesaj gitmedi. Lütfen doğrudan birkankader@gmail.com adresine yazın.',
        required: 'Zorunlu',
      },
      elsewhere: 'Diğer adresler',
      location: 'Ankara, Türkiye. Saat dilimi UTC+3.',
    },
    case: {
      back: 'Tüm işler',
      sections: { context: 'Sorun', idea: 'Fikir', craft: 'Ayrıntılar', outcome: 'Bugün nerede' },
      meta: { year: 'Yıl', role: 'Rol', stack: 'Teknoloji', status: 'Durum', links: 'Bağlantılar' },
      next: 'Sıradaki proje',
      index: (i: number, n: number) => `${String(i).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
    },
    notFound: {
      metaTitle: 'Rota bulunamadı',
      title: 'Rota bulunamadı',
      body: 'Arama bütün haritayı taradı ama bu adrese giden bir yol bulamadı. Sayfa taşınmış olabilir.',
      home: 'Başa dön',
      work: 'İşlere bak',
    },
  },
} as const;

export type UI = (typeof ui)[Lang];
