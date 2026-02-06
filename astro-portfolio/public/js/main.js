if (typeof initI18n === "function") initI18n();
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const closeBtn = document.querySelector(".nav-close");
function closeNav() {
  nav?.classList.remove("open");
  document.querySelectorAll(".nav-dropdown.dropdown-open").forEach((el) => el.classList.remove("dropdown-open"));
  document.querySelectorAll(".nav-dropdown-trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
  document.body.style.overflow = "";
}
if (toggle) {
  toggle.addEventListener("click", () => {
    nav?.classList.toggle("open");
    if (!nav?.classList.contains("open")) {
      document.querySelectorAll(".nav-dropdown.dropdown-open").forEach((el) => el.classList.remove("dropdown-open"));
      document.querySelectorAll(".nav-dropdown-trigger").forEach((t) => t.setAttribute("aria-expanded", "false"));
    }
    document.body.style.overflow = nav?.classList.contains("open") ? "hidden" : "";
  });
}
if (closeBtn) closeBtn.addEventListener("click", closeNav);
document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", closeNav));
document.querySelectorAll(".nav-dropdown-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    if (window.innerWidth <= 920) {
      e.preventDefault();
      const dropdown = trigger.closest(".nav-dropdown");
      if (dropdown) {
        dropdown.classList.toggle("dropdown-open");
        trigger.setAttribute("aria-expanded", dropdown.classList.contains("dropdown-open"));
      }
    }
  });
});

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
