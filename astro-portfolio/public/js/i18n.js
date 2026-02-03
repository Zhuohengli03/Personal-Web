/**
 * 中英文切换：与 Flask 版一致
 * data-i18n="key" 的节点会被替换为对应文案；content-zh / content-en 由 CSS 根据 html[lang] 显示/隐藏
 */
const translations = {
  zh: {
    navHome: "首页",
    navAbout: "关于",
    navSkills: "技能",
    navEducation: "教育",
    navExperience: "经历",
    navProjects: "项目",
    navHonors: "荣誉",
    navCampus: "校园",
    navContact: "联系",
    navResume: "简历",
    navMenuAria: "打开菜单",
    heroGreeting: "你好，我是",
    heroTagline: "纽约大学 管理与分析硕士 · 数据分析与数据工程 · Python · SQL · ETL · BI",
    btnProjects: "看看我的作品",
    btnContact: "联系我",
    sectionAbout: "关于我",
    sectionSkills: "技能",
    sectionEducation: "教育背景",
    sectionExperience: "工作经历",
    sectionProjects: "项目",
    sectionHonors: "荣誉与奖项",
    sectionCampus: "校园与志愿",
    sectionInterests: "兴趣",
    sectionContact: "联系我",
    contactIntro: "欢迎通过以下方式与我交流：",
    footerSite: "个人网站",
    resumePageTitle: "Zhuoheng Li | 简历",
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
    navResume: "Resume",
    navMenuAria: "Open menu",
    heroGreeting: "Hi, I'm",
    heroTagline: "MS in Management & Analytics @ NYU · Data Analytics & Data Engineering · Python · SQL · ETL · BI",
    btnProjects: "View my work",
    btnContact: "Contact me",
    sectionAbout: "About me",
    sectionSkills: "Skills",
    sectionEducation: "Education",
    sectionExperience: "Experience",
    sectionProjects: "Projects",
    sectionHonors: "Honors & Awards",
    sectionCampus: "Campus Leadership & Volunteering",
    sectionInterests: "Interests",
    sectionContact: "Contact",
    contactIntro: "Feel free to reach out:",
    footerSite: "Personal Site",
    resumePageTitle: "Zhuoheng Li | Resume",
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
  if (isHomePage()) document.title = lang === "zh" ? "Zhuoheng Li | 个人网站" : "Zhuoheng Li | Personal Website";
  else if (p.includes("resume")) document.title = translations[lang].resumePageTitle;
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
  if (isHomePage()) document.title = lang === "zh" ? "Zhuoheng Li | 个人网站" : "Zhuoheng Li | Personal Website";
  else if (typeof location !== "undefined" && location.pathname.includes("resume")) document.title = translations[lang].resumePageTitle;
  applyLang(lang);
  updateSwitcher(lang);
  document.getElementById("lang-zh")?.addEventListener("click", () => setLang("zh"));
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
}
