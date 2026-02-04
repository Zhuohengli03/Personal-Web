if (typeof initI18n === "function") initI18n();
document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
if (toggle) toggle.addEventListener("click", () => nav?.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => nav?.classList.remove("open")));

document.addEventListener("click", (e) => {
  const back = e.target.closest?.("[data-back]");
  if (back) {
    e.preventDefault();
    history.back();
  }
});
