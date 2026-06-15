const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────
cloudinary.config({
  cloud_name: "dxrm5ptbz",
  api_key: "874746376653373",
  api_secret: "gXFsC5DwNXlq6gcCujZOmbiXBOE"
});

const outputFile = path.join(__dirname, "photos-data.js");
const MAX_PER_PAGE = 500;

// ─── Fetch all images from Cloudinary with pagination ─────
async function fetchAllResources() {
  let resources = [];
  let nextCursor = null;

  do {
    const params = {
      type: "upload",
      resource_type: "image",
      max_results: MAX_PER_PAGE
    };
    if (nextCursor) params.next_cursor = nextCursor;

    const result = await cloudinary.api.resources(params);
    resources = resources.concat(result.resources);
    nextCursor = result.next_cursor;
    console.log(`  Fetched ${result.resources.length} images (total: ${resources.length})`);
  } while (nextCursor);

  return resources;
}

// ─── Build photo entries ──────────────────────────────────
function titleFromPublicId(publicId) {
  const base = path.basename(publicId);
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
  // If the cleaned name looks like a serial number, generate a friendly title
  if (/^\d+ [a-z0-9]+ [a-z]$/i.test(cleaned) || /^\d+\s/.test(cleaned)) {
    return false; // will be replaced with numbered title
  }
  return cleaned;
}

function categoryFromPublicId(publicId) {
  const parts = publicId.split("/");
  return parts.length > 1 ? parts[0] : "Uncategorized";
}

function buildPhotos(resources) {
  // Sort by public_id (folder/filename) for consistent ordering
  // Exclude photos not in a named folder (e.g. Cloudinary default samples)
  resources = resources.filter(r => {
    const parts = r.public_id.split("/");
    return parts.length > 1;
  });
  resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

  // First pass: count per category for numbered titles
  const categoryCount = {};
  resources.forEach(r => {
    const cat = categoryFromPublicId(r.public_id);
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const categoryIndex = {};
  for (const cat of Object.keys(categoryCount)) {
    categoryIndex[cat] = 0;
  }

  return resources.map((r) => {
    const cat = categoryFromPublicId(r.public_id);
    categoryIndex[cat]++;

    const rawTitle = titleFromPublicId(r.public_id);
    const title = rawTitle || `Photo ${String(categoryIndex[cat]).padStart(2, "0")}`;
    const year = r.created_at ? r.created_at.substring(0, 4) : "2025";
    const ratio = (r.width && r.height) ? `${r.width} / ${r.height}` : "4 / 5";

    return {
      image: r.secure_url,
      title,
      location: "Add location",
      year,
      category: cat,
      featured: false, // will set below
      ratio,
      alt: `${title} - ${cat} photograph.`
    };
  });
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log("☁️  Fetching images from Cloudinary...\n");

  const resources = await fetchAllResources();
  console.log(`\n📸 Total images in Cloudinary: ${resources.length}`);

  if (resources.length === 0) {
    console.log("⚠️  No images found in Cloudinary.");
    return;
  }

  const photos = buildPhotos(resources);

  // Mark first 12 as featured
  for (let i = 0; i < Math.min(12, photos.length); i++) {
    photos[i].featured = true;
  }

  const contents = `window.photos = ${JSON.stringify(photos, null, 2)};\n`;
  fs.writeFileSync(outputFile, contents, "utf8");

  const categoryNames = [...new Set(photos.map((p) => p.category))];
  console.log(`\n✅ Generated ${photos.length} photos → photos-data.js`);
  console.log(`📂 Categories: ${categoryNames.join(", ")}`);
  console.log(`⭐ Featured: ${Math.min(12, photos.length)} photos`);
}

main().catch(err => {
  console.error("💥 Error:", err.message);
  process.exit(1);
});