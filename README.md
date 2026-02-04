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
├── .github/workflows/     # GitHub Actions 部署
├── astro-portfolio/       # Astro 站点
│   ├── public/            # 静态资源、i18n 脚本
│   ├── src/
│   │   ├── components/    # 组件（Magic UI、ProjectCard）
│   │   ├── content/       # Markdown 内容（项目）
│   │   ├── layouts/
│   │   └── pages/         # 各页面（首页、关于、技能、教育、经历、项目、荣誉、校园、联系、简历）
│   ├── astro.config.mjs
│   └── package.json
└── README.md
```

## 修改内容

- **首页**：`astro-portfolio/src/pages/index.astro`
- **关于 / 技能 / 教育 / 经历 / 荣誉 / 校园 / 联系**：`astro-portfolio/src/pages/*.astro`
- **项目**：`astro-portfolio/src/pages/projects/index.astro`，或新增 `src/content/projects/*.md`
- **中英文案**：`astro-portfolio/public/js/i18n.js`
