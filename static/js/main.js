// 中英文切换（依赖 i18n.js）
if (typeof initI18n === "function") initI18n();

// 当前年份
document.getElementById("year").textContent = new Date().getFullYear();

// 移动端导航切换
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

// 点击导航链接后关闭移动端菜单
document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
        nav.classList.remove("open");
    });
});
