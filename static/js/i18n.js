/**
 * 中英文文案
 * 在 HTML 中用 data-i18n="key" 指定要替换的文案，key 与下方一致
 */
const translations = {
    zh: {
        navHome: "首页",
        navAbout: "关于",
        navProjects: "项目",
        navContact: "联系",
        navMenuAria: "打开菜单",
        heroGreeting: "你好，我是",
        heroName: "你的名字",
        heroTagline: "一句话描述你的身份或方向 · 比如：开发者 / 设计师 / 创作者",
        btnProjects: "看看我的作品",
        btnContact: "联系我",
        sectionAbout: "关于我",
        about1: "在这里写一段简短的自我介绍：你的背景、兴趣、正在做的事，以及你希望访客了解的任何事情。可以分几段写，让版面更易读。",
        about2: "例如：我目前在做 xxx，喜欢 xxx，平时会写写博客、做做开源项目。",
        sectionProjects: "项目与作品",
        project1Title: "项目一",
        project1Desc: "简短描述这个项目做了什么、用了什么技术、解决了什么问题。",
        project2Title: "项目二",
        project2Desc: "同样格式：描述 + 技术/成果。可以链到 GitHub、演示站或文章。",
        project3Title: "项目三",
        project3Desc: "继续添加更多项目卡片，或先保留占位，之后慢慢完善。",
        viewProject: "查看项目 →",
        sectionContact: "联系我",
        contactIntro: "欢迎通过以下方式与我交流：",
        footerCopy: "你的名字 · 个人网站",
    },
    en: {
        navHome: "Home",
        navAbout: "About",
        navProjects: "Projects",
        navContact: "Contact",
        navMenuAria: "Open menu",
        heroGreeting: "Hi, I'm",
        heroName: "Your Name",
        heroTagline: "A short line about who you are · e.g. Developer / Designer / Creator",
        btnProjects: "View my work",
        btnContact: "Contact me",
        sectionAbout: "About me",
        about1: "Write a short intro here: your background, interests, what you're working on, and anything you want visitors to know. You can use multiple paragraphs for readability.",
        about2: "E.g. I'm currently doing xxx, I enjoy xxx, and I write blog posts and work on open source in my spare time.",
        sectionProjects: "Projects & Work",
        project1Title: "Project One",
        project1Desc: "Briefly describe what this project does, what tech you used, and what problem it solves.",
        project2Title: "Project Two",
        project2Desc: "Same format: description + tech/outcome. Link to GitHub, demo, or article.",
        project3Title: "Project Three",
        project3Desc: "Add more project cards here, or keep placeholders and fill them in later.",
        viewProject: "View project →",
        sectionContact: "Contact",
        contactIntro: "Feel free to reach out:",
        footerCopy: "Your Name · Personal Site",
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
    document.title = lang === "zh" ? "个人网站" : "Personal Website";
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
    document.title = lang === "zh" ? "个人网站" : "Personal Website";
    applyLang(lang);
    updateSwitcher(lang);

    document.getElementById("lang-zh")?.addEventListener("click", () => setLang("zh"));
    document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
}
