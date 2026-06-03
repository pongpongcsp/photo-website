const defaultWorks = [
  {
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1300&q=80",
    title: "Late Crossing",
    location: "Tokyo",
    year: "2025",
    category: "Street",
    alt: "Night street crossing with soft city lights.",
    featured: true,
    ratio: "4 / 5"
  },
  {
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1300&q=80",
    title: "After Rain",
    location: "Kyoto",
    year: "2024",
    category: "Travel",
    alt: "Quiet Japanese street after rainfall.",
    featured: true,
    ratio: "3 / 4"
  },
  {
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1300&q=80",
    title: "Soft Profile",
    location: "Paris",
    year: "2023",
    category: "Portrait",
    alt: "Minimal portrait in soft natural light.",
    featured: true,
    ratio: "4 / 5"
  },
  {
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    title: "North Ridge",
    location: "Iceland",
    year: "2023",
    category: "Landscape",
    alt: "Wide mountain landscape beneath a quiet sky.",
    featured: true,
    ratio: "5 / 4"
  },
  {
    image: "https://images.unsplash.com/photo-1473959383410-bdd0746e0b11?auto=format&fit=crop&w=1300&q=80",
    title: "Old Harbor",
    location: "Porto",
    year: "2022",
    category: "Travel",
    alt: "Historic harbor buildings in muted daylight.",
    featured: true,
    ratio: "4 / 5"
  },
  {
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    title: "Quiet Geometry",
    location: "Seoul",
    year: "2025",
    category: "Street",
    alt: "Architectural lines forming a quiet urban composition.",
    featured: true,
    ratio: "5 / 4"
  },
  {
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1300&q=80",
    title: "Studio Study",
    location: "Berlin",
    year: "2024",
    category: "Portrait",
    alt: "Studio portrait against a plain background.",
    featured: true,
    ratio: "4 / 5"
  },
  {
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1300&q=80",
    title: "Winter Field",
    location: "Hokkaido",
    year: "2025",
    category: "Landscape",
    alt: "Snow mountain and open winter field.",
    featured: true,
    ratio: "3 / 4"
  },
  {
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    title: "Coastal Silence",
    location: "Lisbon",
    year: "2024",
    category: "Travel",
    alt: "Coastal landscape in clear quiet light.",
    featured: true,
    ratio: "5 / 4"
  },
  {
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1300&q=80",
    title: "Dune Line",
    location: "Namibia",
    year: "2021",
    category: "Landscape",
    alt: "Minimal natural lines across a desert landscape.",
    featured: false,
    ratio: "4 / 5"
  },
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1300&q=80",
    title: "Window Light",
    location: "Taipei",
    year: "2026",
    category: "Portrait",
    alt: "Portrait near a window with quiet light.",
    featured: false,
    ratio: "4 / 5"
  },
  {
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?auto=format&fit=crop&w=1300&q=80",
    title: "Distant Blocks",
    location: "Hong Kong",
    year: "2022",
    category: "Street",
    alt: "Dense city buildings seen from a distance.",
    featured: false,
    ratio: "3 / 4"
  }
];

const generatedWorks = Array.isArray(window.photos) ? window.photos : [];
const works = (generatedWorks.length ? generatedWorks : defaultWorks).map((work, index) => ({
  image: work.image || work.src,
  title: work.title || `Photo ${String(index + 1).padStart(2, "0")}`,
  location: work.location || "",
  year: work.year || "",
  category: work.category || "Uncategorized",
  alt: work.alt || work.title || `Photo ${String(index + 1).padStart(2, "0")}`,
  featured: Boolean(work.featured),
  ratio: work.ratio || "4 / 5"
}));
const categories = ["All", ...new Set(works.map((work) => work.category).filter(Boolean))];
const featuredGrid = document.querySelector("[data-featured-grid]");
const archiveGrid = document.querySelector("[data-archive-grid]");
const filters = document.querySelector("[data-filters]");
const header = document.querySelector("[data-header]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const year = document.querySelector("[data-year]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const closeButton = document.querySelector("[data-lightbox-close]");
const prevButton = document.querySelector("[data-lightbox-prev]");
const nextButton = document.querySelector("[data-lightbox-next]");

let activeList = works;
let activeIndex = 0;
let lastFocusedElement = null;

function workCard(work, index) {
  return `
    <article class="work-item">
      <button class="work-button" type="button" data-index="${index}" aria-label="Open ${work.title}">
        <div class="image-wrap" style="--ratio: ${work.ratio || "4 / 5"}">
          <img src="${work.image}" alt="${work.alt}" loading="lazy">
        </div>
        <div class="work-caption">
          <span>
            <strong class="work-title">${work.title}</strong>
            ${work.location}
          </span>
          <span>${work.year}</span>
        </div>
      </button>
    </article>
  `;
}

function renderImages(container, list) {
  container.innerHTML = list.map((work) => workCard(work, works.indexOf(work))).join("");
  container.querySelectorAll("img").forEach((img) => {
    if (img.complete) img.classList.add("is-loaded");
    img.addEventListener("load", () => img.classList.add("is-loaded"));
  });
}

function renderFilters() {
  filters.innerHTML = categories
    .map((category) => `
      <button class="filter-button ${category === "All" ? "is-active" : ""}" type="button" role="tab" aria-selected="${category === "All"}" data-category="${category}">
        ${category}
      </button>
    `)
    .join("");
}

function renderArchive(category = "All") {
  activeList = category === "All" ? works : works.filter((work) => work.category === category);
  renderImages(archiveGrid, activeList);
}

function openLightbox(index) {
  activeIndex = activeList.findIndex((work) => works.indexOf(work) === index);
  if (activeIndex < 0) {
    activeList = works;
    activeIndex = index;
  }

  lastFocusedElement = document.activeElement;
  updateLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  closeButton.focus();
}

function updateLightbox() {
  const work = activeList[activeIndex];
  lightboxImage.src = work.image.replace("w=1300", "w=1900").replace("w=1400", "w=1900");
  lightboxImage.alt = work.alt;
  lightboxCaption.textContent = `${work.title} / ${work.location} / ${work.year} / ${work.category}`;
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  lightboxImage.removeAttribute("src");
  if (lastFocusedElement) lastFocusedElement.focus();
}

function showRelativeImage(direction) {
  activeIndex = (activeIndex + direction + activeList.length) % activeList.length;
  updateLightbox();
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("portfolio-theme", theme);
  themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
}

function initTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(savedTheme || systemTheme);
}

renderFilters();
renderImages(featuredGrid, works.filter((work) => work.featured).slice(0, 12));
renderArchive();
initTheme();
year.textContent = new Date().getFullYear();

document.addEventListener("click", (event) => {
  const workButton = event.target.closest("[data-index]");
  if (workButton) openLightbox(Number(workButton.dataset.index));
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  filters.querySelectorAll(".filter-button").forEach((filter) => {
    const isActive = filter === button;
    filter.classList.toggle("is-active", isActive);
    filter.setAttribute("aria-selected", String(isActive));
  });

  renderArchive(button.dataset.category);
});

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", () => showRelativeImage(-1));
nextButton.addEventListener("click", () => showRelativeImage(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showRelativeImage(-1);
  if (event.key === "ArrowRight") showRelativeImage(1);
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 6);
});
