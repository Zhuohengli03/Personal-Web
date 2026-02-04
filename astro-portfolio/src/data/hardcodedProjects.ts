/**
 * 核心代码片段，用于在项目详情页展示（如爬虫项目）
 */
export interface CodeSnippet {
  titleZh: string;
  titleEn: string;
  lang: string;
  code: string;
}

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
  /** 核心代码片段（可选），在正文后、图库前展示 */
  codeSnippets?: CodeSnippet[];
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
    bodyZh: '本项目是一个基于 **Streamlit** 与 **Selenium** 的动态网页爬虫系统，面向具有无限滚动加载和复杂 DOM 结构的网页场景，实现从页面采集、字段抽取、数据清洗到数据库存储与检索的一体化流程。\n\n系统支持通过多种定位方式（XPath、CSS Selector、ID、Class、Tag）对页面元素进行精确定位，并提供关键词与正则匹配模式，用于自动提取网页中的链接、图片、邮箱和电话号码等信息。同时支持新闻详情页与列表页混合爬取，并通过自动滚动机制解决动态加载页面的数据获取问题。\n\n在数据处理层面，系统支持将爬取结果导出为 CSV / Excel 文件，并可直接写入 **MySQL** 数据库，同时提供基于关键词和正则表达式的本地数据库检索功能，方便后续分析与复用。\n\n该项目完整覆盖了动态数据采集、结构化抽取、数据存储与检索等关键流程，提升了对复杂网页数据获取和工程化爬虫系统设计的实践能力。',
    bodyEn: 'This project is a dynamic web crawler system based on **Streamlit** and **Selenium**, targeting pages with infinite scroll and complex DOM structures. It implements an integrated workflow from page fetching, field extraction, data cleaning, to database storage and retrieval.\n\nThe system supports precise element location via multiple methods (XPath, CSS Selector, ID, Class, Tag), and provides keyword and regex matching to automatically extract links, images, email addresses, and phone numbers. It supports mixed crawling of news detail and list pages, and uses automatic scrolling to handle dynamically loaded content.\n\nOn the data side, results can be exported to CSV/Excel and written directly to **MySQL**, with local database search by keyword and regex for later analysis and reuse.\n\nThe project covers dynamic data collection, structured extraction, storage, and retrieval, and demonstrates practical ability in complex web data acquisition and engineered crawler design.',
    codeSnippets: [
      {
        titleZh: '页面滚动加载 scroll_and_collect()',
        titleEn: 'Scroll & collect: scroll_and_collect()',
        lang: 'python',
        code: `def scroll_and_collect(self):
    y = 0
    max_scroll_attempts = 20  # Reduced max attempts
    previous_count = 0

    st.info("开始滚动收集内容...")

    while len(self.collected_urls) < self.total_need and y < max_scroll_attempts:
        # Simple scroll to bottom
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(self.time_sleep)  # Wait for content to load

        y += 1

        # Find elements and check progress
        current_elements = self._safe_find_elements(self.main_locator)

        # Check if we're making progress
        if len(current_elements) == previous_count:
            if y >= 3:  # No progress for 3 consecutive scrolls
                break
        else:
            previous_count = len(current_elements)

        # Collect URLs from current view
        self.collect()

        if len(self.collected_urls) >= self.total_need:
            break`,
      },
      {
        titleZh: 'URL 收集 collect() — 关键词模式',
        titleEn: 'URL collection collect() — keyword mode',
        lang: 'python',
        code: `if self.main_key_words:
    xpath_query = f"//\${self.main_url_key_words}[contains(@\${select_1}, '\${select_2}')]"
    all_elements = self.driver.find_elements(By.XPATH, xpath_query)

    # Collect URLs from elements
    zhengze_list = []
    for i, element in enumerate(all_elements):
        zhengze_url = element.get_attribute("href")
        if zhengze_url and zhengze_url not in self.collected_urls:
            zhengze_list.append(zhengze_url)
            if len(self.collected_urls) + len(zhengze_list) >= self.total_need:
                break

    # Process the new URLs
    for url in zhengze_list:
        hurl = urljoin(self.url, url)
        self.zhengze_calculate(hurl)
        self.collected_urls.append(url)`,
      },
      {
        titleZh: '详情页内容提取 content()',
        titleEn: 'Detail page extraction content()',
        lang: 'python',
        code: `def content(self):
    for sin_url in self.collected_urls:
        final_content = {"title": "", "url": sin_url, "content": "", "image": "", "HTML": ""}

        self.driver.get(sin_url)
        time.sleep(self.time_sleep)

        # 获取HTML
        page = self.driver.page_source
        content = BeautifulSoup(page, "lxml")
        final_content["HTML"] = str(content)

        # 提取标题
        title_element = self.driver.find_elements(*self.title_locator)
        if title_element:
            final_content["title"] = title_element[0].text

        # 提取正文
        content_element = self.driver.find_elements(*self.content_locator)
        if content_element:
            final_content["content"] = content_element[0].text

        # 提取图片
        img_urls = []
        img_element = self.driver.find_elements(*self.image_locator)
        for src in img_element:
            img_url = src.get_attribute("src")
            img_urls.append(img_url)
        final_content["image"] = "\\n".join(img_urls)

        self.results.append(final_content)

    return self.results`,
      },
      {
        titleZh: '正则提取 zhengze_calculate()',
        titleEn: 'Regex extraction zhengze_calculate()',
        lang: 'python',
        code: `def zhengze_calculate(self, hurl: str) -> None:
    """使用正则表达式提取页面内容"""
    self.driver.get(hurl)

    page = self.driver.page_source
    content = BeautifulSoup(page, "lxml")

    zhengze_content = {"URL": hurl}
    key_words = self.main_key_words

    # 使用配置的正则模式
    if key_words in REGEX_PATTERNS:
        pattern = REGEX_PATTERNS[key_words]
        matches = re.findall(pattern, str(content))

        if matches:
            results = set(str(m) for m in matches)
            zhengze_content[key_words] = "\\n".join(results)

    self.zhengze_text.append(zhengze_content)`,
      },
      {
        titleZh: '正则模式配置 config.py',
        titleEn: 'Regex patterns config.py',
        lang: 'python',
        code: `REGEX_PATTERNS = {
    "网址": r'https?://[^\\s<>"\\']+',
    "URL": r'https?://[^\\s<>"\\']+',
    "电话": r'1[3-9]\\d{9}|0\\d{2,3}-?\\d{7,8}',
    "Phone": r'1[3-9]\\d{9}|0\\d{2,3}-?\\d{7,8}',
    "邮箱": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    "Email": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    "图片": r'<img[^>]+src=["\\']([^"\\']+)["\\']',
    "Image": r'<img[^>]+src=["\\']([^"\\']+)["\\']',
}`,
      },
    ],
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
