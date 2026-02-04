# 项目详情页：文字与图片

## 图片

每个项目都有单独文件夹，详情页会自动展示该文件夹内的配图。

- **硬编码项目**（已建好单独文件夹）：
  - `crawler/` — 动态爬虫与数据采集平台
  - `game-market/` — 游戏市场数据分析与预测系统
  - `nasa-space-apps/` — NASA Space Apps Challenge
  - `ecommerce-analytics/` — 电商用户与营销分析
  - `social-salary/` — 社交网络与起薪分析
- **Markdown 项目**：在 `public/projects/` 下新建与 slug 同名的文件夹（与 `src/content/projects/` 文件名一致，不含 `.md`），将图片放入即可。
- **格式**：支持 `.jpg`、`.jpeg`、`.png`、`.webp`、`.gif`，按文件名排序展示。
- 将图片放入对应项目文件夹后重新构建，详情页会显示「项目图片」区块。

## 文字

### Markdown 项目（`src/content/projects/*.md`）

在对应 `.md` 文件中直接写正文，支持完整 Markdown（标题、列表、加粗、图片等）。引用本项目配图示例：

```markdown
![说明](/projects/你的slug/图片文件名.jpg)
```

### 硬编码项目（`src/data/hardcodedProjects.ts`）

在对应项目对象中增加可选字段：

- **bodyZh**：中文正文。支持 **粗体**，段落用空行分隔。
- **bodyEn**：英文正文。支持 **bold**，段落用空行分隔。

示例：

```ts
{
  slug: 'crawler',
  titleZh: '...',
  titleEn: '...',
  descriptionZh: '...',
  descriptionEn: '...',
  bodyZh: '第一段正文。\n\n第二段，可写 **加粗**。',
  bodyEn: 'First paragraph.\n\nSecond paragraph with **bold**.',
  tech: [...],
  pubDate: '2024-06-01',
}
```

保存后重新构建，详情页会在简介下方显示这段正文。
