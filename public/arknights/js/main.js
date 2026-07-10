const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

function syncHeaderState() {
  if (!header) return;
  header.dataset.elevated = window.scrollY > 8 ? "true" : "false";
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
