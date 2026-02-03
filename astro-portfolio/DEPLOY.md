# GitHub Pages 部署配置说明

按下面步骤检查，部署才能成功。

---

## 1. 在仓库里开启 GitHub Pages（必须）

1. 打开你的 GitHub 仓库，例如：`https://github.com/Zhuohengli03/Personal-Web`
2. 点击 **Settings（设置）**
3. 左侧找到 **Pages**
4. 在 **Build and deployment** 里：
   - **Source** 选 **GitHub Actions**（不要选 “Deploy from a branch”）

如果这里选的是 “Deploy from a branch”，GitHub 不会用我们的 workflow，页面不会更新。

---

## 2. 确认仓库名和访问地址

- **用户/组织站**：仓库名为 `用户名.github.io`  
  访问地址：`https://你的用户名.github.io`  
  此时 `astro.config.mjs` 里保持 `base: '/'` 即可。

- **项目站**：仓库名是普通名字，例如 `Personal-Web`  
  访问地址：`https://你的用户名.github.io/Personal-Web/`  
  此时必须在 `astro-portfolio/astro.config.mjs` 里改两处：

```js
site: 'https://Zhuohengli03.github.io',
base: '/Personal-Web/',   // 改成你的仓库名，前后都有斜杠
```

改完后在项目里执行一次 `npm run build`，再推送代码，等 workflow 跑完再访问上面的地址。

---

## 3. 推送代码触发部署

- 把代码推到 **main** 分支（或你 workflow 里写的分支）。
- 打开仓库 **Actions** 页，看 “Deploy Astro portfolio to GitHub Pages” 是否成功。
- 若 **build** 失败：看日志里报错（常见是依赖安装失败，已用 `npm ci` 或 `npm install` 兜底）。
- 若 **deploy** 失败：多半是 Pages 的 Source 没选 “GitHub Actions”，回到第 1 步检查。

---

## 4. 首次部署前生成本地 lock 文件（推荐）

在本地执行一次，生成 `package-lock.json` 并提交，可避免 CI 依赖问题：

```bash
cd astro-portfolio
npm install
```

然后提交并推送 `astro-portfolio/package-lock.json`。

---

## 检查清单

- [ ] Settings → Pages → Source = **GitHub Actions**
- [ ] 若是项目站，已把 `site` 和 `base` 改成你的用户名和仓库名
- [ ] 已推送代码到 main（或对应分支）
- [ ] Actions 里该 workflow 显示绿色成功

完成以上后，用浏览器打开你的 Pages 地址即可看到站点。
