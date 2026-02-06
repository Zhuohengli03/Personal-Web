if (typeof initI18n === "function") initI18n();
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    nav?.classList.toggle("open");
    document.body.style.overflow = nav?.classList.contains("open") ? "hidden" : "";
  });
}
document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => {
  nav?.classList.remove("open");
  document.body.style.overflow = "";
}));

// 处理 data-back 返回上一页
document.querySelectorAll("[data-back]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });
});
