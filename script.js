const samplePhotos = [
  {
    title: "Late Crossing",
    location: "Tokyo",
    year: "2025",
    category: "Street",
    featured: true,
    ratio: "4 / 5",
    src: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1100&q=78",
    alt: "A quiet city street at night with glowing signs and pedestrians."
  },
  {
    title: "Blue Platform",
    location: "Lisbon",
    year: "2024",
    category: "Travel",
    featured: true,
    ratio: "3 / 4",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=78",
    alt: "A scenic coastal view with warm light and open sky."
  },
  {
    title: "Window Light",
    location: "Taipei",
    year: "2026",
    category: "Portrait",
    featured: true,
    ratio: "4 / 5",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1100&q=78",
    alt: "A softly lit portrait of a person near a window."
  },
  {
    title: "North Ridge",
    location: "Iceland",
    year: "2023",
    category: "Landscape",
    featured: true,
    ratio: "5 / 4",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=78",
    alt: "A dramatic mountain landscape under a wide sky."
  },
  {
    title: "Morning Queue",
    location: "Hong Kong",
    year: "2024",
    category: "Street",
    ratio: "3 / 4",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1100&q=78",
    alt: "People moving through a bright public space."
  },
  {
    title: "Quiet Transit",
    location: "Seoul",
    year: "2025",
    category: "Street",
    ratio: "4 / 3",
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=78",
    alt: "Architectural lines and calm urban geometry."
  },
  {
    title: "Old Harbor",
    location: "Porto",
    year: "2023",
    category: "Travel",
    ratio: "4 / 5",
    src: "https://images.unsplash.com/photo-1473959383410-bdd0746e0b11?auto=format&fit=crop&w=1100&q=78",
    alt: "A historic city view with textured buildings and soft daylight."
  },
  {
    title: "After Rain",
    location: "Kyoto",
    year: "2025",
    category: "Travel",
    ratio: "5 / 4",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=78",
    alt: "A traditional street scene after rain."
  },
  {
    title: "Studio Study",
    location: "Berlin",
    year: "2024",
    category: "Portrait",
    ratio: "4 / 5",
    src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1100&q=78",
    alt: "A minimal studio portrait with neutral background."
  },
  {
    title: "Soft Profile",
    location: "Paris",
    year: "2023",
    category: "Portrait",
    ratio: "3 / 4",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=78",
    alt: "A contemplative portrait in soft natural light."
  },
  {
    title: "Dune Line",
    location: "Namibia",
    year: "2024",
    category: "Landscape",
    ratio: "4 / 3",
    src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=78",
    alt: "A quiet landscape with clean natural lines."
  },
  {
    title: "Winter Field",
    location: "Hokkaido",
    year: "2025",
    category: "Landscape",
    ratio: "3 / 4",
    src: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1100&q=78",
    alt: "Snowy mountains and open winter terrain."
  }
];

const photos = Array.isArray(window.photos) && window.photos.length ? window.photos : samplePhotos;

const featuredGrid = document.querySelector("[data-featured-grid]");
const portfolioGrid = document.querySelector("[data-portfolio-grid]");
const filterBar = document.querySelector("[data-filter-bar]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const closeLightboxButton = document.querySelector("[data-lightbox-close]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const header = document.querySelector("[data-header]");

function photoMarkup(photo, index) {
  return `
    <article class="photo-card">
      <button class="photo-button" type="button" data-photo-index="${index}" aria-label="Open ${photo.title}">
        <div class="photo-media" style="--ratio: ${photo.ratio}">
          <img src="${photo.src}" alt="${photo.alt}" loading="lazy">
        </div>
        <div class="photo-meta">
          <span>
            <strong class="photo-title">${photo.title}</strong>
            ${photo.location}
          </span>
          <span class="photo-detail">${photo.year}<br>${photo.category}</span>
        </div>
      </button>
    </article>
  `;
}

function renderFeatured() {
  featuredGrid.innerHTML = photos
    .map((photo, index) => ({ photo, index }))
    .filter((item) => item.photo.featured)
    .map((item) => photoMarkup(item.photo, item.index))
    .join("");
}

function renderPortfolio(category = "All") {
  portfolioGrid.innerHTML = photos
    .map((photo, index) => ({ photo, index }))
    .filter((item) => category === "All" || item.photo.category === category)
    .map((item) => photoMarkup(item.photo, item.index))
    .join("");
}

function openLightbox(photo) {
  lightboxImage.src = photo.src.replace("w=1100", "w=1800").replace("w=1200", "w=1800");
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = `${photo.title} - ${photo.location}, ${photo.year} / ${photo.category}`;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeLightboxButton.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lightboxImage.removeAttribute("src");
}

function handlePhotoClick(event) {
  const button = event.target.closest("[data-photo-index]");
  if (!button) return;
  openLightbox(photos[Number(button.dataset.photoIndex)]);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("photo-theme", theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem("photo-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

renderFeatured();
renderPortfolio();
initTheme();

document.querySelector("[data-year]").textContent = new Date().getFullYear();
featuredGrid.addEventListener("click", handlePhotoClick);
portfolioGrid.addEventListener("click", handlePhotoClick);

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  filterBar.querySelectorAll(".filter-button").forEach((item) => {
    item.classList.toggle("is-active", item === button);
    item.setAttribute("aria-selected", String(item === button));
  });

  renderPortfolio(button.dataset.category);
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

closeLightboxButton.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
});
