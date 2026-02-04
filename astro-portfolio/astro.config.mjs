import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
// 项目站（例如 https://Zhuohengli03.github.io/Personal-Web/）必须设置 base 为仓库名
export default defineConfig({
  site: 'https://Zhuohengli03.github.io',
  // 使用自定义域名（如 https://www.lzhpw.com/）时站点在根路径，base 必须是 '/'
  // 若以后切回 GitHub Pages 仓库路径部署，再改回 '/Personal-Web/'
  base: '/',
  build: {
    format: 'directory',
    /** 子页面样式丢失：只有首页会加载 index.xxx.css，其他页缺少布局样式。改为 always 后所有 CSS 内联到每页，各栏目样式一致。 */
    inlineStylesheets: 'always',
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
