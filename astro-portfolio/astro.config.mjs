import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/',
  // For GitHub Pages project site use: base: '/repo-name/'
  build: {
    format: 'directory', // Clean URLs: /resume/, /projects/etl-pipeline/
  },
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      langs: ['python', 'sql', 'bash', 'json'],
    },
  },
});
