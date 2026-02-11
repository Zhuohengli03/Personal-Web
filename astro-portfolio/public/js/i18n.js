/**
 * 中英文案统一配置
 * - data-i18n="key" 的节点会被替换为当前语言的文案
 * - content-zh / content-en 由 CSS 根据 html[lang] 显示/隐藏
 *
 * 键名分组：导航 nav* | 首页欢迎 hero* | 按钮 btn* | 区块标题 section* | 联系 contact* |
 * 页脚 footer* | 页面标题 *PageTitle | 简历 resume* | 其他页 others*
 */
const translations = {
  zh: {
    // 导航
    navHome: "首页",
    navAbout: "关于",
    navSkills: "技能",
    navEducation: "教育",
    navExperience: "工作",
    navProjects: "项目",
    navHonors: "荣誉",
    navCampus: "校园",
    navContact: "联系",
    navGuestbook: "留言",
    navOthers: "其他",
    navResume: "简历",
    navMenuAria: "打开菜单",
    navBack: "返回上一页",
    // 首页欢迎
    heroGreeting: "你好，我是",
    heroWelcomeZh: "欢迎来到我的小站",
    heroWelcomeEn: "Welcome",
    heroTagline: "纽约大学 管理与分析硕士 · 数据分析与数据工程 · Python · SQL · ETL · BI",
    // 按钮
    btnProjects: "查看我的项目",
    btnContact: "联系我",
    btnViewMore: "查看更多",
    // 区块标题
    sectionAbout: "关于我",
    sectionSkills: "技能",
    sectionEducation: "教育背景",
    sectionExperience: "工作经历",
    sectionProjects: "项目",
    sectionHonors: "荣誉与奖项",
    sectionCampus: "校园与志愿",
    sectionInterests: "兴趣",
    sectionContact: "联系我",
    sectionOthers: "其他",
    xianGuqinIntro: "古琴简介",
    xianMomentsFeed: "动态",
    projectsMoreMarkdown: "更多（Markdown）",
    projectIntroTitleZh: "简介",
    projectIntroTitleEn: "Introduction",
    projectGalleryTitleZh: "展示",
    projectGalleryTitleEn: "Showcase",
    projectCodeTitleZh: "核心代码",
    projectCodeTitleEn: "Core Code",
    // 联系
    contactIntro: "欢迎通过以下方式与我交流：",
    // 页脚
    footerSiteZh: "个人网站",
    footerSiteEn: "Personal Site",
    footerSite: "个人网站",
    // 摄影 / 博客 / 游乐场
    sectionPhotography: "摄影",
    photographyIntroZh: "响应式图片网格，后续可接入灯箱等。",
    photographyIntroEn: "A responsive grid; add lightbox later if needed.",
    sectionBlog: "博客",
    blogIntroZh: "敬请期待。",
    blogIntroEn: "Coming soon.",
    sectionPlayground: "游乐场",
    playgroundIntroZh: "敬请期待。",
    playgroundIntroEn: "Coming soon.",
    // 页面标题（用于 document.title）
    resumePageTitle: "李卓衡 | 简历",
    aboutPageTitle: "关于 | 李卓衡",
    skillsPageTitle: "技能 | 李卓衡",
    educationPageTitle: "教育 | 李卓衡",
    experiencePageTitle: "工作 | 李卓衡",
    honorsPageTitle: "荣誉 | 李卓衡",
    campusPageTitle: "校园 | 李卓衡",
    contactPageTitle: "联系 | 李卓衡",
    guestbookPageTitle: "留言 | 李卓衡",
    projectsPageTitle: "项目 | 李卓衡",
    othersPageTitle: "其他 | 李卓衡",
    nyuPageTitle: "纽约大学 | 李卓衡",
    xianPageTitle: "西安音乐学院 | 李卓衡",
    photographyPageTitle: "摄影 | 李卓衡",
    blogPageTitle: "博客 | 李卓衡",
    playgroundPageTitle: "游乐场 | 李卓衡",
    // 简历页
    resumeDownloadPdf: "下载 PDF",
    resumeViewBelow: "下方预览或新标签打开",
    resumeFallbackPrefix: "若无法加载，请",
    resumeFallbackLink: "在新标签页打开",
    resumeFallbackSuffix: "。",
    // 其他页
    othersIntroZh: "此处可添加照片等内容。",
  },
  en: {
    navHome: "Home",
    navAbout: "About",
    navSkills: "Skills",
    navEducation: "Education",
    navExperience: "Experience",
    navProjects: "Projects",
    navHonors: "Honors",
    navCampus: "Campus",
    navContact: "Contact",
    navGuestbook: "Guestbook",
    navOthers: "Others",
    navResume: "Resume",
    navMenuAria: "Open menu",
    navBack: "Back",
    heroGreeting: "Hi, I'm",
    heroWelcomeZh: "欢迎来到我的小站",
    heroWelcomeEn: "Welcome",
    heroTagline: "MS in Management & Analytics @ NYU · Data Analytics & Data Engineering · Python · SQL · ETL · BI",
    btnProjects: "View my projects",
    btnContact: "Contact me",
    btnViewMore: "View more",
    sectionAbout: "About me",
    sectionSkills: "Skills",
    sectionEducation: "Education",
    sectionExperience: "Experience",
    sectionProjects: "Projects",
    sectionHonors: "Honors & Awards",
    sectionCampus: "Campus & Volunteering",
    sectionInterests: "Interests",
    sectionContact: "Contact",
    sectionOthers: "Others",
    xianGuqinIntro: "Guqin Introduction",
    xianMomentsFeed: "Moments",
    sectionPhotography: "Photography",
    photographyIntroZh: "响应式图片网格，后续可接入灯箱等。",
    photographyIntroEn: "A responsive grid; add lightbox later if needed.",
    sectionBlog: "Blog",
    blogIntroZh: "敬请期待。",
    blogIntroEn: "Coming soon.",
    sectionPlayground: "Playground",
    playgroundIntroZh: "敬请期待。",
    playgroundIntroEn: "Coming soon.",
    projectsMoreMarkdown: "More (from Markdown)",
    projectIntroTitleZh: "简介",
    projectIntroTitleEn: "Introduction",
    projectGalleryTitleZh: "展示",
    projectGalleryTitleEn: "Showcase",
    projectCodeTitleZh: "核心代码",
    projectCodeTitleEn: "Core Code",
    contactIntro: "Feel free to reach out:",
    footerSiteZh: "个人网站",
    footerSiteEn: "Personal Site",
    footerSite: "Personal Site",
    resumePageTitle: "Zhuoheng Li | Resume",
    aboutPageTitle: "About | Zhuoheng Li",
    skillsPageTitle: "Skills | Zhuoheng Li",
    educationPageTitle: "Education | Zhuoheng Li",
    experiencePageTitle: "Experience | Zhuoheng Li",
    honorsPageTitle: "Honors | Zhuoheng Li",
    campusPageTitle: "Campus | Zhuoheng Li",
    contactPageTitle: "Contact | Zhuoheng Li",
    guestbookPageTitle: "Guestbook | Zhuoheng Li",
    projectsPageTitle: "Projects | Zhuoheng Li",
    othersPageTitle: "Others | Zhuoheng Li",
    nyuPageTitle: "New York University | Zhuoheng Li",
    xianPageTitle: "Xi'an Conservatory | Zhuoheng Li",
    photographyPageTitle: "Photography | Zhuoheng Li",
    blogPageTitle: "Blog | Zhuoheng Li",
    playgroundPageTitle: "Playground | Zhuoheng Li",
    resumeDownloadPdf: "Download PDF",
    resumeViewBelow: "View below or open in a new tab",
    resumeFallbackPrefix: "If the PDF doesn't load, ",
    resumeFallbackLink: "open in a new tab",
    resumeFallbackSuffix: ".",
    othersIntroEn: "Add photos and more content here.",
  },
};

const STORAGE_KEY = "site-lang";
const DEFAULT_LANG = "zh";

function getLang() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
}

function setLang(lang) {
  if (!translations[lang]) return;
  localStorage.setItem(STORAGE_KEY, lang);
  applyLang(lang);
  updateSwitcher(lang);
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  const p = typeof location !== "undefined" && location.pathname ? location.pathname : "";
  applyPageTitle(lang, p);
}

function applyPageTitle(lang, pathname) {
  const p = (pathname || (typeof location !== "undefined" && location.pathname) || "").replace(/\/$/, "");
  const t = translations[lang];
  if (!t) return;
  if (isHomePage()) {
    document.title = lang === "zh" ? "李卓衡 | 个人网站" : "Zhuoheng Li | Personal Website";
    return;
  }
  const key = p.includes("about") ? "aboutPageTitle" : p.includes("skills") ? "skillsPageTitle" : p.includes("nyu") ? "nyuPageTitle" : p.includes("xian") ? "xianPageTitle" : p.includes("education") ? "educationPageTitle" : p.includes("experience") ? "experiencePageTitle" : p.includes("honors") ? "honorsPageTitle" : p.includes("campus") ? "campusPageTitle" : p.includes("contact") ? "contactPageTitle" : p.includes("guestbook") ? "guestbookPageTitle" : p.includes("projects") ? "projectsPageTitle" : p.includes("photography") ? "photographyPageTitle" : p.includes("blog") ? "blogPageTitle" : p.includes("playground") ? "playgroundPageTitle" : p.includes("others") ? "othersPageTitle" : p.includes("resume") ? "resumePageTitle" : null;
  if (key && t[key]) document.title = t[key];
}

function isHomePage() {
  if (typeof location === "undefined" || !location.pathname) return true;
  const p = location.pathname.replace(/\/$/, "") || "/";
  const segments = p.split("/").filter(Boolean);
  return segments.length <= 1 || (segments.length === 2 && segments[1] === "index.html");
}

function applyLang(lang) {
  const t = translations[lang];
  if (!t) return;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (t[key] !== undefined) el.setAttribute("aria-label", t[key]);
  });
}

function updateSwitcher(lang) {
  const zhBtn = document.getElementById("lang-zh");
  const enBtn = document.getElementById("lang-en");
  if (zhBtn) zhBtn.classList.toggle("active", lang === "zh");
  if (enBtn) enBtn.classList.toggle("active", lang === "en");
}

function initI18n() {
  const lang = getLang();
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  applyPageTitle(lang);
  applyLang(lang);
  updateSwitcher(lang);
  document.getElementById("lang-zh")?.addEventListener("click", () => setLang("zh"));
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
}

