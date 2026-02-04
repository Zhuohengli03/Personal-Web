/**
 * Hardcoded project entries shown on /projects/.
 * Each has a slug used for the detail page: /projects/[slug]/
 */
export interface HardcodedProject {
  slug: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  /** 详情页正文（可选）。支持 **粗体**，段落用空行分隔。 */
  bodyZh?: string;
  /** 详情页正文英文（可选）。支持 **bold**，段落用空行分隔。 */
  bodyEn?: string;
  tech: string[];
  pubDate: string; // ISO date for display
  repo?: string;
  link?: string;
}

export const hardcodedProjects: HardcodedProject[] = [
  {
    slug: 'crawler',
    titleZh: '动态爬虫与数据采集平台',
    titleEn: 'Dynamic Web Crawler & Data Collection Platform',
    descriptionZh: '使用 **Selenium + BeautifulSoup** 搭建可复用动态页爬虫，支持无限滚动与复杂 DOM；设计标准化 **ETL** 清洗/解析并写入 **MySQL/PostgreSQL**；可配置 XPath/CSS/正则提取框架；错误处理与重试保证稳定性；**Streamlit** 配置任务、批量运行与导出。',
    descriptionEn: 'Built a reusable crawler for dynamic pages using **Selenium + BeautifulSoup**, supporting infinite scroll and complex DOM structures. Designed a standardized **ETL pipeline** to clean/parse data and load into **MySQL/PostgreSQL**. Created a configurable extraction framework (XPath/CSS selector/regex). Implemented error handling and retry mechanisms. Developed a **Streamlit** UI for task configuration, batch runs, monitoring, and export.',
    tech: ['Selenium', 'BeautifulSoup', 'PostgreSQL', 'MySQL', 'Streamlit', 'ETL'],
    pubDate: '2024-06-01',
  },
  {
    slug: 'game-market',
    titleZh: '游戏市场数据分析与预测系统',
    titleEn: 'Computer Game Market Data Analysis & Forecasting System',
    descriptionZh: '基于 **PostgreSQL** 自动化采集与存储，含去重与批量写入；调度与中断恢复实现 **24/7** 更新；特征工程与多模型预测（**Random Forest、Gradient Boosting、ARIMA、Prophet**）；输出 7 日预测、趋势与风险区间，支持买卖决策。',
    descriptionEn: 'Automated data ingestion and storage with **PostgreSQL**, including scraping, deduplication, and batch inserts. Built a resilient pipeline with scheduling and interruption control for **24/7** updates. Performed feature engineering + multi-model forecasting (**Random Forest, Gradient Boosting, ARIMA, Prophet**). Delivered **7-day forecasts**, trend indicators, and risk intervals to support buy/sell/hold decisions.',
    tech: ['PostgreSQL', 'Random Forest', 'Gradient Boosting', 'ARIMA', 'Prophet'],
    pubDate: '2024-05-01',
  },
  {
    slug: 'nasa-space-apps',
    titleZh: 'NASA Space Apps Challenge — 数据分析项目',
    titleEn: 'NASA Space Apps Challenge — Data Analytics Project',
    descriptionZh: '整合多个 NASA/JPL 开放 API，将多源 JSON 统一为一致 schema；参与后端 API 设计（参数与响应结构），支撑地图/图表/模拟页；结合影响范围与人口、经济数据做暴露与风险可视化。',
    descriptionEn: 'Integrated multiple NASA/JPL open APIs; standardized multi-source JSON into consistent schemas. Supported backend API design (parameters + response structures) to power maps/charts/simulation pages. Combined impact range outputs with population/economic data for exposure and risk visualization.',
    tech: ['NASA APIs', 'JSON', 'Data visualization'],
    pubDate: '2024-04-01',
  },
  {
    slug: 'ecommerce-analytics',
    titleZh: '电商用户与营销分析',
    titleEn: 'E-commerce User & Marketing Analytics',
    descriptionZh: '搭建 KPI 体系（UV/PV、漏斗转化、留存、复购），端到端分析用户行为；构建 cohort 数据集与统一指标；**RFM + K-means** 用户分群，识别高价值与流失风险；基于分群表现给出营销与广告优化建议。',
    descriptionEn: 'Built KPI system (UV/PV, funnel conversion, retention, repurchase) to analyze user behavior end-to-end. Created cohort datasets with consistent metric definitions. Segmented users via **RFM + K-means**, identifying high-value and churn-risk groups. Produced targeted marketing and ad optimization recommendations based on segment performance.',
    tech: ['RFM', 'K-means', 'Cohort analysis', 'KPI'],
    pubDate: '2024-03-01',
  },
  {
    slug: 'social-salary',
    titleZh: '社交网络与起薪分析',
    titleEn: 'Social Networks & Starting Salary Analysis',
    descriptionZh: '基于问卷数据构建分析数据集，完成清洗、重编码与缺失值处理；描述统计、分组比较与相关分析探索社交网络使用与结果的关系；产出图表与结论用于团队报告与课堂展示。',
    descriptionEn: 'Built an analysis dataset from survey data; performed cleaning, recoding, and missing-value handling. Used descriptive stats, group comparisons, and correlation analysis to explore links between social network usage and outcomes. Delivered visuals and insights for team report and class presentation.',
    tech: ['Survey data', 'Statistical analysis', 'Visualization'],
    pubDate: '2023-12-01',
  },
];

export function getHardcodedProjectBySlug(slug: string): HardcodedProject | undefined {
  return hardcodedProjects.find((p) => p.slug === slug);
}
