# 李卓衡 · 个人网站

基于 **Astro** 构建的静态个人网站，支持中英双语切换，部署到 GitHub Pages。

**在线访问**：https://lizhuoheng.com

## 功能特点

- 中英双语支持（实时切换）
- 响应式设计，适配移动端
- 玻璃拟态（Glassmorphism）UI 风格
- 流体光标特效
- 自定义背景图片/视频
- 图片灯箱（双击放大）
- 项目详情页支持代码高亮、视频、图片展示

## 本地开发

```bash
cd astro-portfolio
npm install
npm run dev
```

浏览器打开：http://localhost:4321/

## 构建与部署

```bash
npm run build   # 构建产物在 dist/
```

推送到 `main` 分支后，GitHub Actions 自动部署到 GitHub Pages。

## 网站结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 欢迎语、随机名言、关于我、技能、教育背景 |
| 经历 | `/experience/` | 工作/实习经历 |
| 项目 | `/projects/` | 个人项目 + 校园/社会项目 |
| 项目详情 | `/projects/[slug]/` | 各项目详细介绍、代码、截图、视频 |
| 教育 | `/education/` | NYU、西安音乐学院 |
| 教育详情 | `/education/nyu/`、`/education/xian/` | 课程、荣誉、古琴介绍等 |
| 联系 | `/contact/` | 联系方式 |
| 简历 | `/resume/` | 嵌入 PDF 简历 |
| 摄影 | `/photography/` | 摄影作品展示 |
| 博客 | `/blog/` | 博客（待完善） |
| 游乐场 | `/playground/` | 实验项目（待完善） |
| 关于 | `/about/` | 关于我、技能、教育（完整版） |

## 目录结构

```
├── .github/workflows/          # GitHub Actions 部署配置
├── astro-portfolio/
│   ├── public/
│   │   ├── avatar.jpg          # 头像
│   │   ├── background/         # 全页背景图片/视频
│   │   ├── education/          # 教育页面图片
│   │   │   └── xian/           # 西安音乐学院相关图片
│   │   ├── js/
│   │   │   ├── fluid-cursor.js # 流体光标特效
│   │   │   ├── i18n.js         # 国际化脚本
│   │   │   └── main.js         # 主脚本
│   │   ├── photography/        # 摄影作品
│   │   └── projects/           # 项目截图/视频
│   │       ├── crawler/
│   │       ├── ecommerce-analytics/
│   │       ├── game-market/
│   │       ├── nasa-space-apps/
│   │       └── operations-product-analytics/
│   ├── src/
│   │   ├── components/
│   │   │   ├── magic/          # 特效组件（BorderBeam、AnimatedGradientText 等）
│   │   │   ├── ProfileSidebar.astro  # 左侧个人信息栏
│   │   │   └── ProjectCard.astro     # 项目卡片
│   │   ├── content/projects/   # Markdown 项目内容
│   │   ├── data/
│   │   │   ├── hardcodedProjects.ts  # 硬编码项目数据
│   │   │   └── quotes.json           # 首页随机名言
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro      # 全局布局
│   │   └── pages/              # 页面文件
│   ├── astro.config.mjs        # Astro 配置
│   └── package.json
└── README.md
```

## 如何修改

### 添加/修改项目

1. **硬编码项目**：编辑 `src/data/hardcodedProjects.ts`
2. **项目图片**：添加到 `public/projects/[slug]/` 目录（自动识别）
3. **项目视频**：添加 `.mp4`/`.webm` 到 `public/projects/[slug]/`

### 修改中英文文案

- 页面内文字：使用 `<span class="content-zh">` 和 `<span class="content-en">`
- 动态文字：编辑 `public/js/i18n.js`

### 更换背景

将图片（`background.jpg`/`.png`）或视频（`background.mp4`/`.webm`）放入 `public/background/` 目录。

### 添加摄影作品

将图片添加到 `public/photography/` 目录，页面自动读取显示。

## 技术栈

- **框架**：Astro 4.x
- **样式**：CSS（玻璃拟态 + 响应式）
- **字体**：Noto Sans/Serif SC、Source Sans 3、Dancing Script
- **部署**：GitHub Pages + GitHub Actions
- **特效**：WebGL 流体光标、CSS 动画

## License

MIT
