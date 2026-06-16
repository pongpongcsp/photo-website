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

// All folders in the order we want them to appear in the website
// IMPORTANT: These are Cloudinary Media Library Asset Folder names, not public_id prefixes
// All folders with full Media Library folder paths
const FOLDERS = [
  "20250809_台北南港_TRE",
  "20250810_台北大巨蛋_樂天女孩",
  "20250824_電腦節_樂天女孩",
  "20250928_桃園_樂天女孩",
  "20260328_台北大巨蛋_樂天女孩",
  "20260329_台北大巨蛋_樂天女孩",
  "20260606_台中洲際_PassionSister",
  "20260607_台北南港_金佳垠",
  "20260607_台北大巨蛋_UniGirls",
  "峮峮"
];

// ─── Rate-limit-aware helper ─────────────────────────────
async function fetchAllFromFolder(folder) {
  let resources = [];
  let cursor = null;
  do {
    const params = { max_results: 500 };
    if (cursor) params.next_cursor = cursor;
    const res = await cloudinary.api.resources_by_asset_folder(folder, params);
    resources = resources.concat(res.resources);
    cursor = res.next_cursor;
    // Be nice to rate limits
    if (cursor) await new Promise(r => setTimeout(r, 250));
  } while (cursor);
  return resources;
}

// ─── Build photo entries ──────────────────────────────────────
function titleFromPublicId(publicId) {
  const base = path.basename(publicId);
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
  // If the cleaned name looks like a serial number, generate a friendly title
  if (/^\d+ [a-z0-9]+ [a-z]$/i.test(cleaned) || /^\d+\s/.test(cleaned)) {
    return false;
  }
  return cleaned;
}

async function buildPhotos() {
  let allPhotos = [];

  for (const folder of FOLDERS) {
    process.stdout.write(`☁️  Fetching folder "${folder}"... `);
    try {
      const resources = await fetchAllFromFolder(folder);
      console.log(`✅ ${resources.length} assets`);

      // Count for numbered titles within this folder
      let index = 0;
      for (const r of resources) {
        index++;
        // Use the folder name as the category
        const cat = folder;
        const rawTitle = titleFromPublicId(r.public_id);
        const title = rawTitle || `Photo ${String(index).padStart(2, "0")}`;
        const year = r.created_at ? r.created_at.substring(0, 4) : "2025";
        const ratio = (r.width && r.height) ? `${r.width} / ${r.height}` : "4 / 5";

        allPhotos.push({
          image: r.secure_url,
          title,
          location: "Add location",
          year,
          category: cat,
          featured: false,
          ratio,
          alt: `${title} - ${cat} photograph.`
        });
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  return allPhotos;
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  console.log("☁️  Building photos-data.js from Cloudinary Media Library folders...\n");
  console.log("📂 Fetching each folder individually via resources_by_asset_folder API\n");

  const photos = await buildPhotos();
  console.log(`\n📸 Total photos: ${photos.length}`);

  if (photos.length === 0) {
    console.log("⚠️  No photos found. Rate limit might still be active.");
    console.log("   Wait a few minutes and try again.");
    return;
  }

  // Mark first 12 as featured
  for (let i = 0; i < Math.min(12, photos.length); i++) {
    photos[i].featured = true;
  }

  const contents = `window.photos = ${JSON.stringify(photos, null, 2)};\n`;
  fs.writeFileSync(outputFile, contents, "utf8");

  // Count per category
  const categoryNames = [...new Set(photos.map((p) => p.category))];
  const catCounts = {};
  photos.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

  console.log(`✅ Generated ${photos.length} photos → photos-data.js`);
  console.log(`📂 Categories:`);
  for (const cat of categoryNames) {
    console.log(`   ${cat}: ${catCounts[cat]} photos`);
  }
  console.log(`⭐ Featured: ${Math.min(12, photos.length)} photos`);
}

main().catch(err => {
  console.error("💥 Error:", err);
  process.exit(1);
});