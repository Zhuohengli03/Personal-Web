import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
// 使用自定义域名 lizhuoheng.com 时，base 应为 '/'
export default defineConfig({
  site: 'https://lizhuoheng.com',
  base: '/',
  build: {
    format: 'directory',
  },
  integrations: [tailwind()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      langs: ['python', 'sql', 'bash', 'json'],
    },
  },
});
