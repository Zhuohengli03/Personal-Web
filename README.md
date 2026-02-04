# 个人网站

基于 **Astro** 的静态个人网站，中英双语，部署到 GitHub Pages。

## 本地运行

```bash
cd astro-portfolio
npm install
npm run dev
```

浏览器打开：<http://localhost:4321>

## 构建与部署

```bash
cd astro-portfolio
npm run build
```

构建产物在 `astro-portfolio/dist/`。推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

- 部署说明见：`astro-portfolio/DEPLOY.md`
- 项目说明见：`astro-portfolio/README.md`

## 项目结构

```
├── .github/workflows/     # GitHub Actions 部署（deploy-astro.yml）
├── astro-portfolio/       # Astro 站点
│   ├── public/            # 静态资源
│   │   ├── background/    # 全页背景图/视频（见内 README）
│   │   ├── education/     # 教育详情页图片（nyu/、xian/、xian/moments/）
│   │   ├── js/            # i18n.js、main.js
│   │   ├── photography/   # 摄影页图片
│   │   └── projects/      # 各项目详情页配图（crawler/、game-market/ 等）
│   ├── src/
│   │   ├── components/    # 组件（ProfileSidebar、ProjectCard、MomentsPost 等）
│   │   ├── content/       # Markdown 内容（项目）
│   │   ├── data/          # 硬编码项目、quotes 等
│   │   ├── layouts/
│   │   └── pages/         # 首页、关于、技能、教育、经历、项目、联系、简历、摄影/博客/游乐场等
│   ├── astro.config.mjs
│   └── package.json
└── README.md
```

## 修改内容

- **首页**：`src/pages/index.astro`
- **关于 / 技能 / 教育 / 经历 / 联系 / 简历**：`src/pages/*.astro`
- **项目**：`src/pages/projects/index.astro`、`src/data/hardcodedProjects.ts`，或新增 `src/content/projects/*.md`
- **教育详情配图**：见 `public/education/README.md`；**项目配图**：见 `public/projects/README.md`
- **中英文案**：`public/js/i18n.js`
