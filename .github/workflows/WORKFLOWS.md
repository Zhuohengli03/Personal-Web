# 本仓库的 GitHub Actions 说明

## 当前 workflow

| 文件 | 名称 | 触发条件 | 作用 |
|------|------|----------|------|
| **deploy-astro.yml** | Deploy Astro portfolio to GitHub Pages | 推送到 `main` 或 手动运行 | 构建并部署 Astro 站点到 GitHub Pages |

---

## deploy-astro.yml 说明

- 有 **configure-pages**，和官方推荐写法一致。
- 有 **npm 缓存**（有 `package-lock.json` 时用 `npm ci`，没有则 `npm install`）。
- 支持 **手动触发**（Actions 页里 “Run workflow”）。

---

## deploy-astro.yml 在做什么（简要）

1. **build 任务**
   - 检出代码
   - 在 `astro-portfolio/` 下安装依赖（有 lock 用 `npm ci`，否则 `npm install`）
   - 执行 `npm run build`，生成 `astro-portfolio/dist/`
   - 用 **configure-pages** 配置 Pages
   - 把 **astro-portfolio/dist** 作为 artifact 上传

2. **deploy 任务**
   - 依赖 build 完成
   - 用 **deploy-pages** 把上传的 artifact 部署到 GitHub Pages

最终网站来源是 **GitHub Actions**，不是某个分支（例如不是 gh-pages）。

---

## 在 GitHub 上需要配合的配置

- **Settings → Pages → Build and deployment**
  - **Source** 选 **GitHub Actions**（不要选 “Deploy from a branch”）。

这样每次推 main（或手动跑 deploy-astro）后，就会用 `astro-portfolio/dist` 更新 Pages。
