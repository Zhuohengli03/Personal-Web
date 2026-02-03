import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
// 项目站（例如 https://Zhuohengli03.github.io/Personal-Web/）必须设置 base 为仓库名
export default defineConfig({
  site: 'https://Zhuohengli03.github.io',
  base: '/Personal-Web/',
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
