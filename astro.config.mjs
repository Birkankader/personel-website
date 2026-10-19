import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical, Open Graph and the sitemap all derive from `site`. The plugin repository builder
// (scripts/build-plugin-repository.mjs) also expects this origin in every download URL.
export default defineConfig({
  site: 'https://birkankader.com',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', tr: 'tr' } },
    }),
  ],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto', format: 'directory' },
  devToolbar: { enabled: false },
});
