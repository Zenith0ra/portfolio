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

const chips = document.querySelectorAll("[data-filter]");
const operatorCards = document.querySelectorAll(".operator-card[data-tags]");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;

    chips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");

    operatorCards.forEach((card) => {
      const tags = card.dataset.tags || "";
      card.hidden = filter !== "all" && !tags.split(" ").includes(filter);
    });
  });
});
