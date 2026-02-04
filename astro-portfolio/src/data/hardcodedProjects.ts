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
    bodyZh: '本项目是一个面向游戏虚拟物品市场的自动化数据采集与智能分析系统。系统基于 **Darker Market API**，构建了从数据采集、清洗去重、数据库存储到价格预测与时间序列分析的一体化数据管道。\n\n系统支持多物品的动态配置与自动发现机制，可在无需修改代码的情况下扩展新的物品类型；在数据层面，采用 **PostgreSQL** 进行集中管理，并实现批量写入与重复数据控制；在分析层面，集成多种机器学习模型与时间序列模型（**Random Forest、Gradient Boosting、LSTM、ARIMA、Prophet** 等），用于价格预测、趋势分析与风险评估。\n\n该项目完整覆盖了真实业务场景下的数据工程流程与分析建模流程，体现了对自动化数据采集、可扩展系统设计以及数据驱动决策支持系统的实践能力。',
    bodyEn: 'This project is an automated data collection and analytics system for in-game virtual item markets. Built on the **Darker Market API**, it implements an end-to-end pipeline from data ingestion, cleaning and deduplication, database storage, to price forecasting and time-series analysis.\n\nThe system supports dynamic multi-item configuration and auto-discovery, allowing new item types to be added without code changes. Data is stored in **PostgreSQL** with batch writes and duplicate control. On the analytics side, it integrates multiple ML and time-series models (**Random Forest, Gradient Boosting, LSTM, ARIMA, Prophet**, etc.) for price prediction, trend analysis, and risk assessment.\n\nThe project covers the full data-engineering and modeling workflow in a real business setting, demonstrating practical ability in automated data collection, scalable system design, and data-driven decision support.',
    codeSnippets: [
      {
        titleZh: '数据采集模块 — API 数据收集类',
        titleEn: 'Data collection — API collector (DarkerMarketAPI)',
        lang: 'python',
        code: `class DarkerMarketAPI:
    def __init__(self):
        self.item = "Iron Ore"
        self.seen_records = set()  # 去重集合
        self.no_new_data_count = 0  # 连续无新数据计数
        self.max_no_new_data = 3   # 自动停止阈值

    def run(self):
        self.db = DarkerMarketDB(items=self.item.replace(" ", "_").lower())
        self._load_existing_records()
        while self.page < 200 and self.no_new_data_count < 3:
            new_data_count = self.get_market_data()
            if new_data_count > 0:
                self.no_new_data_count = 0
            else:
                self.no_new_data_count += 1
            self.page += 1
        self.total_inserted = self.db.batch_insert_all_data()
        self.save_data_to_csv()

    def get_market_data(self):
        response = requests.get(url, params=params, headers=self.headers)
        new_data = []
        for item in data["body"]:
            record_key = f"{item['id']}_{item['created_at']}"
            if record_key not in self.seen_records:
                new_data.append(item)
                self.seen_records.add(record_key)
        self.db.add_data(new_data)
        return len(new_data)`,
      },
      {
        titleZh: '数据库模块 — 批量插入与去重',
        titleEn: 'Database — batch insert & deduplication',
        lang: 'python',
        code: `class DarkerMarketDB:
    def batch_insert_all_data(self):
        cursor = self.connector.cursor()
        cursor.execute("SELECT item_id, created_at FROM " + self.items)
        existing_records = set()
        for row in cursor.fetchall():
            existing_records.add(f"{row[0]}_{row[1]}")

        data_to_insert = []
        for item in self.all_data:
            record_key = f"{item['id']}_{item['created_at']}"
            if record_key not in existing_records:
                data_to_insert.append((
                    item_id, item_name, quantity, price_per_unit,
                    price, has_sold, created_at, datetime.now()
                ))
                existing_records.add(record_key)

        if data_to_insert:
            cursor.executemany(insert_query, data_to_insert)
            self.connector.commit()
        return len(data_to_insert)

    def export_to_csv(self):
        query = "SELECT * FROM " + self.items + " ORDER BY created_at DESC"
        df = pd.read_sql_query(query, self.connector)
        df.to_csv(self.path, index=False, encoding='utf-8')`,
      },
      {
        titleZh: '机器学习模块 — 特征工程（防数据泄露）',
        titleEn: 'ML module — feature engineering (no leakage)',
        lang: 'python',
        code: `def _feature_engineering(self):
    # 时间特征
    self.df['hour'] = self.df['created_at'].dt.hour
    self.df['day_of_week'] = self.df['created_at'].dt.dayofweek
    self.df['is_weekend'] = (self.df['day_of_week'] >= 5).astype(int)

    # 滞后特征（避免数据泄露）
    for lag in [1, 2, 3, 5, 10]:
        self.df['price_lag_%d' % lag] = self.df['price_per_unit'].shift(lag)
        self.df['quantity_lag_%d' % lag] = self.df['quantity'].shift(lag)

    # 移动平均（基于滞后价格）
    for window in [3, 5, 7]:
        self.df['price_ma_%d' % window] = \\
            self.df['price_lag_1'].rolling(window, min_periods=1).mean()

    # 波动性特征
    for window in [5, 10]:
        self.df['price_volatility_%d' % window] = \\
            self.df['price_lag_1'].rolling(window, min_periods=1).std()

    # 交互特征
    self.df['price_quantity_ratio'] = \\
        self.df['price'] / (self.df['quantity'] + 1)`,
      },
      {
        titleZh: '机器学习模块 — 多模型训练与集成',
        titleEn: 'ML module — multi-model training & ensemble',
        lang: 'python',
        code: `def train_models(self):
    models = {
        'Random Forest': RandomForestRegressor(n_estimators=200, max_depth=12),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=200, max_depth=6),
        'Ridge Regression': Ridge(alpha=0.1),
        'Extra Trees': ExtraTreesRegressor(n_estimators=200),
        'MLP': MLPRegressor(hidden_layers=(100, 50))
    }
    for name, model in models.items():
        model.fit(self.X_train_scaled, self.y_train)
        cv_scores = cross_val_score(model, self.X_train_scaled, self.y_train, cv=5, scoring='r2')
        self.models[name] = {'model': model, 'cv_r2_mean': cv_scores.mean(), ...}

def create_ensemble_models(self):
    top_models = sorted(self.models.items(), key=lambda x: x[1]['cv_r2_mean'], reverse=True)[:3]
    weights = self._calculate_dynamic_weights(top_models)
    voting_ensemble = VotingRegressor(
        estimators=[(n, m['model']) for n, m in top_models],
        weights=weights
    )
    return voting_ensemble`,
      },
      {
        titleZh: '任务调度模块 — 异步执行与配置',
        titleEn: 'Scheduler — async execution & config',
        lang: 'python',
        code: `# core_scheduler.py
class SmartScheduler:
    def run_script_async(self, script_path, script_name):
        def run():
            success = self.run_script(script_path, script_name)
        thread = threading.Thread(target=run, name="AsyncTask-" + script_name, daemon=True)
        thread.start()
        return thread

    def add_task_from_config(self, task_config):
        if task_config["schedule_type"] == "daily":
            schedule.every().day.at(task_config["schedule_value"]).do(
                self.run_script_async, script_path=task_config["script_path"], script_name=task_config["name"]
            )
        elif task_config["schedule_type"] == "hourly":
            schedule.every().hour.do(...)

    def start_scheduler(self):
        while True:
            schedule.run_pending()
            time.sleep(1)

# task_config.py
TASKS = [
    {"name": "Iron Ore API", "script_path": "src/api/Iron_Ore_API.py",
     "schedule_type": "daily", "schedule_value": "23:00", "enabled": True},
]`,
      },
    ],
    tech: ['PostgreSQL', 'Random Forest', 'Gradient Boosting', 'ARIMA', 'Prophet'],
    pubDate: '2024-05-01',
  },
  {
    slug: 'nasa-space-apps',
    titleZh: 'NASA Space Apps Challenge — 小行星撞击模拟平台',
    titleEn: 'NASA Space Apps Challenge — Asteroid Impact Simulation Platform',
    descriptionZh: '基于 NASA 开放数据的交互式小行星撞击模拟与分析平台；负责 Prediction 模块，实现 API 接入与可视化联动；从三维地球重构为二维地图展示，提升系统集成稳定性。',
    descriptionEn: 'Web-based interactive asteroid impact simulation platform using NASA open data. Led the Prediction module: API integration and visualization linkage. Refactored from 3D globe to 2D map display for better system integration stability.',
    bodyZh: '（NASA Space Apps Challenge 2025 参赛项目）\n\n本项目是一个基于 Web 的交互式小行星撞击模拟与分析平台，整合了 NASA 公开数据接口，对潜在近地小行星撞击事件进行模拟，并评估其物理影响、环境影响及潜在社会经济影响。\n\n系统集成了多类 NASA 数据源，包括**近地小行星（NEO）、火流星（Fireball）、近距离掠过数据（CAD）**及自然事件数据，并构建了从数据获取、处理到可视化展示的完整分析流程。\n\n我主要负责 **Prediction（预测）模块**，重点承担了小行星撞击模拟相关 API 接入与可视化联动设计。在后端实现了预测相关接口，用于获取和预处理真实小行星数据，并将模拟结果与前端交互界面打通，实现动态参数配置与实时结果展示。\n\n在项目初期，我设计并实现了基于**三维地球模型**的撞击可视化方案，用于在旋转地球表面展示预测结果。但在项目整合阶段，为了保证与其他功能模块的兼容性以及整体前端架构的统一性，我主动重构可视化方案，将预测结果从三维地球视图调整为基于**二维地图的交互式展示**方式，从而提升了系统集成稳定性和团队协作效率。\n\n该模块最终支持实时数据接入、预测计算调用以及地理位置可视化展示，为平台提供了稳定可扩展的预测与展示能力。',
    bodyEn: '(NASA Space Apps Challenge 2025 Competition Project)\n\nThis project is a web-based interactive asteroid impact simulation and analysis platform that integrates NASA open data APIs to simulate potential near-Earth asteroid impact events and assess their physical, environmental, and potential socioeconomic impacts.\n\nThe system integrates multiple NASA data sources, including **Near-Earth Objects (NEO), Fireballs, Close Approach Data (CAD)**, and natural event data, building a complete analysis pipeline from data acquisition and processing to visualization.\n\nI was primarily responsible for the **Prediction module**, focusing on asteroid impact simulation API integration and visualization linkage design. On the backend, I implemented prediction-related interfaces for fetching and preprocessing real asteroid data, and connected simulation results with the frontend interactive interface to enable dynamic parameter configuration and real-time result display.\n\nIn the early project phase, I designed and implemented a **3D globe-based** impact visualization scheme to display prediction results on a rotating Earth surface. However, during the integration phase, to ensure compatibility with other functional modules and overall frontend architecture consistency, I proactively refactored the visualization approach, adjusting prediction results from 3D globe view to **2D map-based interactive display**, thereby improving system integration stability and team collaboration efficiency.\n\nThe module ultimately supports real-time data access, prediction computation calls, and geographic location visualization, providing the platform with stable and extensible prediction and display capabilities.',
    tech: ['NASA APIs', 'Python', 'Data Visualization', 'Web Development'],
    pubDate: '2025-01-01',
  },
  {
    slug: 'ecommerce-analytics',
    titleZh: '电商用户与营销分析',
    titleEn: 'E-commerce User & Marketing Analytics',
    descriptionZh: '搭建 KPI 体系（UV/PV、漏斗转化、留存、复购），端到端分析用户行为；构建 cohort 数据集与统一指标；**RFM + K-means** 用户分群，识别高价值与流失风险；基于分群表现给出营销与广告优化建议。',
    descriptionEn: 'Built KPI system (UV/PV, funnel conversion, retention, repurchase) to analyze user behavior end-to-end. Created cohort datasets with consistent metric definitions. Segmented users via **RFM + K-means**, identifying high-value and churn-risk groups. Produced targeted marketing and ad optimization recommendations based on segment performance.',
    bodyZh: '本项目基于电商广告投放与用户行为数据（user.csv、ad.csv、click.csv），构建完整的数据处理与分析流程，对广告价格区间、点击率表现及用户结构进行系统分析，并通过用户聚类与 **RFM** 模型实现用户价值分层，为广告投放优化与精细化运营提供数据支持。\n\n项目首先对多源数据进行清洗与整合，基于 userid 与 ad_id 构建统一分析数据集，对缺失值与异常值进行处理，并对商品价格进行分箱与编码，形成标准化价格区间特征。在此基础上，计算不同价格区间下的广告点击率，并对各价格区间中不同用户年龄层、性别及用户层级分布进行可视化分析，揭示价格与用户结构、广告效果之间的关系。\n\n进一步地，项目筛选展示量与点击量排名前 100 的广告位，分析各广告位的平均商品价格及价格区间分布，并对点击率排名前 10 与后 10 的广告位进行对比分析，从用户结构与商品价格角度评估高效与低效广告位的差异。\n\n在用户层面，项目基于用户的购物层级、点击行为及浏览商品的平均价格构建特征向量，采用 **K-Means** 聚类方法将用户划分为 5 类用户群体，并结合 **RFM** 模型对不同用户群体进行价值分层，最终形成"重要保持用户、重要发展用户、重要挽留用户、一般用户、低价值用户"五类用户画像，并对各类用户的年龄与性别结构进行可视化分析。\n\n该项目完整覆盖数据预处理、指标构建、广告效果分析、用户画像建模与可视化展示全过程，能够支持广告定价策略优化、用户分层运营及精准营销决策。',
    bodyEn: 'This project builds a complete data processing and analysis pipeline based on e-commerce advertising and user behavior data (user.csv, ad.csv, click.csv). It systematically analyzes ad price ranges, click-through rate performance, and user demographics, and implements user value segmentation through clustering and **RFM** modeling to support ad placement optimization and refined operations.\n\nThe project first cleans and integrates multi-source data, constructing a unified analysis dataset based on userid and ad_id, handling missing values and outliers, and binning/encoding product prices to create standardized price range features. Based on this, it calculates ad click-through rates across different price ranges and visualizes user age, gender, and tier distributions within each price range, revealing relationships between price, user structure, and ad effectiveness.\n\nFurthermore, the project filters the top 100 ad slots by impressions and clicks, analyzes average product prices and price range distributions for each slot, and compares the top 10 and bottom 10 ad slots by CTR, evaluating differences between high-performing and low-performing placements from user structure and product price perspectives.\n\nAt the user level, the project constructs feature vectors based on shopping tier, click behavior, and average browsed product price, using **K-Means** clustering to segment users into 5 groups. Combined with the **RFM** model for value stratification, it produces five user personas: "Important Retain", "Important Develop", "Important Win-back", "General", and "Low-value" users, with visualizations of age and gender distributions for each segment.\n\nThe project covers the full workflow from data preprocessing, metric construction, ad performance analysis, user profiling, to visualization, supporting ad pricing strategy optimization, user-tiered operations, and precision marketing decisions.',
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
  {
    slug: 'operations-product-analytics',
    titleZh: '运营与选品分析项目',
    titleEn: 'Operations & Product Selection Analytics Project',
    descriptionZh: '整合多业务系统数据，构建选品指标框架（销量、销售额、增长率、转化率、退款率等）；输出每日运营简报，支撑快速决策；聚焦商品与品类表现差异，识别异常并协助业务调整策略。',
    descriptionEn: 'Integrated multi-system data to build a product selection metrics framework (sales volume, revenue, growth rate, conversion, refund rate, etc.). Delivered daily operations briefs for rapid decision-making. Focused on product/category performance gaps, identified anomalies, and supported business strategy adjustments.',
    bodyZh: '该项目围绕运营监控与选品分析构建了一套可复用的数据分析与报表体系，负责从多业务系统中整合销售、库存、页面访问、退款及商品维度数据，对原始数据进行清洗、字段标准化与口径统一，形成稳定的分析数据集。在此基础上，设计并搭建了以商品表现为核心的选品指标框架，系统覆盖**销量、销售额、增长率、页面浏览量、转化表现与退款率**等关键运营指标，并将指标结果结构化输出为每日运营简报，为团队提供可快速决策的监控视图。\n\n在分析过程中，重点聚焦商品层级与品类层级的表现差异，通过趋势分析与对比分析识别销量波动与异常变化，尤其对退款率异常商品进行专项排查，结合商品属性、销售节奏及库存状态定位潜在问题原因，协助业务团队及时调整运营策略和商品管理方案。同时，将指标体系应用于选品评估场景，从**商品成长性、稳定性与风险表现**三个维度对候选商品进行数据支持，为新品引入与商品结构优化提供定量依据。',
    bodyEn: 'This project built a reusable data analytics and reporting framework centered on operations monitoring and product selection analysis. It integrates sales, inventory, page traffic, refunds, and product-dimension data from multiple business systems, performing data cleaning, field standardization, and metric alignment to create a stable analytical dataset. Based on this foundation, a product-performance-centric selection metrics framework was designed, systematically covering key operational indicators including **sales volume, revenue, growth rate, page views, conversion performance, and refund rate**, with structured output as daily operations briefs to provide the team with rapid decision-making dashboards.\n\nDuring analysis, the focus was on performance gaps at both product and category levels. Trend analysis and comparative analysis were used to identify sales fluctuations and anomalies, with special attention to products with abnormal refund rates. By combining product attributes, sales rhythm, and inventory status, potential root causes were identified to help the business team promptly adjust operations strategies and product management plans. Additionally, the metrics framework was applied to product selection evaluation, providing data support for candidate products across three dimensions: **growth potential, stability, and risk performance**, offering quantitative evidence for new product introduction and product portfolio optimization.',
    tech: ['Data Analytics', 'KPI', 'Reporting', 'Product Selection'],
    pubDate: '2024-02-01',
  },
];

export function getHardcodedProjectBySlug(slug: string): HardcodedProject | undefined {
  return hardcodedProjects.find((p) => p.slug === slug);
}
