// Copy for the Markdown viewer (/md-viewer/, /tr/md-viewer/), written separately in each language
// like site.ts, under the same rules: no em or en dashes, sentence case. Placeholders in braces
// ({name}) are filled in by the page script.
import type { Lang } from './site';

const fence = '```';

const sampleEn = `---
title: An example
note: front matter like this is read and left out of the page
---

# MD Viewer

A small Markdown viewer. It started as a Windows app (WinForms, WebView2 and Markdig) and runs here
in your browser as well.

## What it does

- Opens a file you drop on the page or pick with <kbd>Ctrl</kbd>+<kbd>O</kbd>
- Draws the file again each time it is saved, and keeps your place on the page
- Follows your system's light or dark setting
- Tables, task lists, footnotes[^1], alert blocks and YAML front matter
- Relative images and links to other \`.md\` files work once you open the folder
- Scripts in the Markdown's HTML never run

> [!TIP]
> Open a whole folder with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd>. Its Markdown files are
> listed beside the page, and links between them open here.

## Shortcuts

| Key | Action |
| --- | --- |
| <kbd>Ctrl</kbd>+<kbd>O</kbd> | Open a file |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> | Open a folder |
| <kbd>F5</kbd> | Read the file again |
| <kbd>Ctrl</kbd>+<kbd>F</kbd> | Find on the page |
| <kbd>Alt</kbd>+<kbd>←</kbd> | Back to the previous file |

## Code

${fence}ts
const route = astar(grid, kizilay, target, { cost: slope });
${fence}

> [!NOTE]
> Nothing you open is uploaded. The page reads the file in your browser and draws it there.

## To do

- [x] Viewing
- [x] Live reload
- [ ] Syntax highlighting

[^1]: Like this one.
`;

const sampleTr = `---
title: Bir örnek
not: bunun gibi bir front matter okunur ama sayfaya basılmaz
---

# MD Viewer

Küçük bir Markdown görüntüleyici. Windows uygulaması olarak başladı (WinForms, WebView2 ve
Markdig), artık tarayıcınızda da çalışıyor.

## Neler yapıyor

- Sayfaya sürüklenip bırakılan ya da <kbd>Ctrl</kbd>+<kbd>O</kbd> ile seçilen dosyayı açar
- Dosya her kaydedildiğinde yeniden çizer, sayfada kaldığınız yeri korur
- Sisteminizin açık ya da koyu temasına uyar
- Tablolar, görev listeleri, dipnotlar[^1], uyarı blokları ve YAML front matter
- Klasörü açtığınızda göreli resimler ve diğer \`.md\` dosyalarına verilen linkler çalışır
- Markdown içindeki HTML'deki script'ler **çalıştırılmaz**

> [!TIP]
> Bütün bir klasörü <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> ile açabilirsiniz. İçindeki
> Markdown dosyaları sayfanın yanında listelenir, aralarındaki linkler burada açılır.

## Kısayollar

| Tuş | İşlev |
| --- | --- |
| <kbd>Ctrl</kbd>+<kbd>O</kbd> | Dosya aç |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> | Klasör aç |
| <kbd>F5</kbd> | Dosyayı yeniden oku |
| <kbd>Ctrl</kbd>+<kbd>F</kbd> | Sayfada ara |
| <kbd>Alt</kbd>+<kbd>←</kbd> | Önceki dosyaya dön |

## Kod

${fence}ts
const rota = astar(izgara, kizilay, hedef, { maliyet: egim });
${fence}

> [!NOTE]
> Açtığınız hiçbir şey bir yere yüklenmez. Sayfa dosyayı tarayıcınızda okur ve orada çizer.

## Yapılacaklar

- [x] Temel görüntüleme
- [x] Otomatik yenileme
- [ ] Kod renklendirme

[^1]: Bunun gibi.
`;

export const mdViewer = {
  en: {
    metaTitle: 'MD Viewer',
    description: 'A Markdown viewer that runs in your browser. Drop in a file or a folder: it is read and drawn on your machine, redrawn as you save, and never uploaded.',
    kicker: 'A tool on this site',
    title: 'MD Viewer',
    lead: 'Drop a Markdown file or a whole folder anywhere on this page, or pick one. It is drawn here, in your browser, and drawn again each time you save it.',
    zone: 'Drop zone',
    open: 'Open file',
    openFolder: 'Open folder',
    sample: 'Show an example',
    reload: 'Reload',
    files: 'Files',
    filter: 'Filter files',
    recent: 'Last opened',
    drop: 'Drop to open',
    privacy: 'Nothing is uploaded. Your browser reads the file and draws it; the only things fetched from the web are images the document itself links to there.',
    support: 'This browser opens files and folders as they are at that moment. For live reload, use Chrome or Edge.',
    shortcutsTitle: 'Shortcuts',
    shortcuts: [
      { keys: ['Ctrl', 'O'], what: 'Open a file' },
      { keys: ['Ctrl', 'Shift', 'O'], what: 'Open a folder' },
      { keys: ['F5'], what: 'Read the file again' },
      { keys: ['Alt', '←'], what: 'Back to the previous file' },
      { keys: ['Ctrl', 'F'], what: 'Find on the page' },
    ],
    desktop: 'Also a Windows app, built with WinForms, WebView2 and Markdig.',
    client: {
      locale: 'en-US',
      title: 'MD Viewer',
      status: { file: 'FILE', size: 'SIZE', words: 'WORDS', read: 'READ', saved: 'SAVED', live: 'LIVE', still: 'STATIC' },
      minutes: 'min',
      folderCount: '{n} files',
      sampleName: 'example.md',
      sample: sampleEn,
      footnotes: { label: 'Footnotes', back: 'Back to reference {0}' },
      msg: {
        notMarkdown: '{name} is not a Markdown file.',
        unreadable: '{name} could not be read.',
        changed: '{name} changed on disk. Open it again to see the new version.',
        tooLarge: '{name} is larger than 20 MB.',
        needFolder: 'Links and images next to this file need its folder. Open the folder to follow them.',
        missing: '{path} is not in this folder.',
        cannotOpen: '{name} cannot be shown in the browser.',
        denied: 'The browser did not allow access.',
        reading: 'Reading {name}',
        empty: 'There are no Markdown files in {name}.',
        truncated: 'Showing the first {n} Markdown files.',
        gone: '{name} is no longer there. Live reload stopped.',
      },
    },
  },
  tr: {
    metaTitle: 'MD Viewer',
    description: 'Tarayıcıda çalışan bir Markdown görüntüleyici. Bir dosya ya da klasör bırakın: bilgisayarınızda okunur ve çizilir, kaydettikçe yenilenir, hiçbir yere yüklenmez.',
    kicker: 'Bu sitedeki bir araç',
    title: 'MD Viewer',
    lead: 'Bir Markdown dosyasını ya da bütün bir klasörü bu sayfada herhangi bir yere bırakın veya seçin. Dosya burada, tarayıcınızda çizilir; her kaydettiğinizde yeniden.',
    zone: 'Bırakma alanı',
    open: 'Dosya aç',
    openFolder: 'Klasör aç',
    sample: 'Örneği göster',
    reload: 'Yenile',
    files: 'Dosyalar',
    filter: 'Dosyaları süz',
    recent: 'Son açılan',
    drop: 'Açmak için bırakın',
    privacy: 'Hiçbir şey yüklenmez. Dosyayı tarayıcınız okur ve çizer; webden yalnızca belgenin kendisinin oraya bağladığı resimler gelir.',
    support: 'Bu tarayıcı dosya ve klasörleri açıldıkları andaki haliyle gösterir. Canlı yenileme için Chrome ya da Edge kullanın.',
    shortcutsTitle: 'Kısayollar',
    shortcuts: [
      { keys: ['Ctrl', 'O'], what: 'Dosya aç' },
      { keys: ['Ctrl', 'Shift', 'O'], what: 'Klasör aç' },
      { keys: ['F5'], what: 'Dosyayı yeniden oku' },
      { keys: ['Alt', '←'], what: 'Önceki dosyaya dön' },
      { keys: ['Ctrl', 'F'], what: 'Sayfada ara' },
    ],
    desktop: 'WinForms, WebView2 ve Markdig ile yazılmış bir Windows uygulaması olarak da var.',
    client: {
      locale: 'tr-TR',
      title: 'MD Viewer',
      status: { file: 'DOSYA', size: 'BOYUT', words: 'KELİME', read: 'OKUMA', saved: 'KAYIT', live: 'CANLI', still: 'SABİT' },
      minutes: 'dk',
      folderCount: '{n} dosya',
      sampleName: 'ornek.md',
      sample: sampleTr,
      footnotes: { label: 'Dipnotlar', back: '{0} numaralı göndermeye dön' },
      msg: {
        notMarkdown: '{name} bir Markdown dosyası değil.',
        unreadable: '{name} okunamadı.',
        changed: '{name} diskte değişti. Yeni halini görmek için yeniden açın.',
        tooLarge: '{name} 20 MB’tan büyük.',
        needFolder: 'Bu dosyanın yanındaki linkler ve resimler için klasörü gerekiyor. Onları izlemek için klasörü açın.',
        missing: '{path} bu klasörde yok.',
        cannotOpen: '{name} tarayıcıda gösterilemiyor.',
        denied: 'Tarayıcı erişime izin vermedi.',
        reading: '{name} okunuyor',
        empty: '{name} içinde Markdown dosyası yok.',
        truncated: 'İlk {n} Markdown dosyası gösteriliyor.',
        gone: '{name} artık orada değil. Canlı yenileme durdu.',
      },
    },
  },
} satisfies Record<Lang, unknown>;

export type MdViewerClient = (typeof mdViewer)[Lang]['client'];
