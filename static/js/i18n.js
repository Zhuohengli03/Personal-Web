/**
 * 中英文文案
 * 在 HTML 中用 data-i18n="key" 指定要替换的文案，key 与下方一致
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
    document.title = lang === "zh" ? "Zhuoheng Li | 个人网站" : "Zhuoheng Li | Personal Website";
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
    document.title = lang === "zh" ? "Zhuoheng Li | 个人网站" : "Zhuoheng Li | Personal Website";
    applyLang(lang);
    updateSwitcher(lang);

    document.getElementById("lang-zh")?.addEventListener("click", () => setLang("zh"));
    document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
}
