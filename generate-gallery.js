const fs = require("fs");
const path = require("path");

const root = __dirname;
const imagesDir = path.join(root, "images");
const outputFile = path.join(root, "photos-data.js");
const categories = new Set(["Street", "Travel", "Portrait", "Landscape"]);
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith(".")) return [];
    if (entry.isDirectory()) return walk(fullPath);
    if (!imageExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [fullPath];
  });
}

function webPath(filePath) {
  return path
    .relative(root, filePath)
    .split(path.sep)
    .map(encodeURIComponent)
    .join("/");
}

function titleFromFilename(filename, index) {
  const base = path.basename(filename, path.extname(filename));
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

  if (/^\d+ [a-z0-9]+ [a-z]$/i.test(cleaned) || /^\d+\s/.test(cleaned)) {
    return `Photo ${String(index + 1).padStart(2, "0")}`;
  }

  return cleaned || `Photo ${String(index + 1).padStart(2, "0")}`;
}

function categoryFromPath(filePath) {
  const parent = path.basename(path.dirname(filePath));
  return categories.has(parent) ? parent : "Street";
}

function readImageSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png" && buffer.toString("ascii", 12, 16) === "IHDR") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if ((ext === ".jpg" || ext === ".jpeg") && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5)
        };
      }
      offset += 2 + length;
    }
  }

  if (ext === ".webp" && buffer.toString("ascii", 0, 4) === "RIFF") {
    const type = buffer.toString("ascii", 12, 16);
    if (type === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3)
      };
    }
  }

  return null;
}

function ratioFor(filePath) {
  const size = readImageSize(filePath);
  if (!size || !size.width || !size.height) return "4 / 5";
  return `${size.width} / ${size.height}`;
}

const files = walk(imagesDir).sort((a, b) => a.localeCompare(b));
const photos = files.map((filePath, index) => {
  const stats = fs.statSync(filePath);
  const category = categoryFromPath(filePath);
  const title = titleFromFilename(filePath, index);
  const year = String(stats.mtime.getFullYear());

  return {
    title,
    location: "Add location",
    year,
    category,
    featured: index < 4,
    ratio: ratioFor(filePath),
    src: webPath(filePath),
    alt: `${title} - ${category} photograph.`
  };
});

const contents = `window.photos = ${JSON.stringify(photos, null, 2)};\n`;
fs.writeFileSync(outputFile, contents);

console.log(`Generated ${photos.length} photos in photos-data.js`);
console.log("Put photos into images/Street, images/Travel, images/Portrait, or images/Landscape to categorize them.");
