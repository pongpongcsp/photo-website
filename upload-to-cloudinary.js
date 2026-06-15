const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────
cloudinary.config({
  cloud_name: 'dxrm5ptbz',
  api_key: '874746376653373',
  api_secret: 'gXFsC5DwNXlq6gcCujZOmbiXBOE'
});

const SOURCE_DIR = 'D:\\Photo\\20260606_台中洲際_PassionSister_Compressed\\BEST_KEEPER';
const CLOUDINARY_FOLDER = '20260606_台中洲際_PassionSister';
const CONCURRENCY = 10;       // 同時 upload 幾多張
const LOG_FILE = 'upload-log.json';
const SKIP_EXISTING = true;   // 如果 log 記錄過就 skip，方便 resume

// ─── Helpers ──────────────────────────────────────────────

/** 行晒成個 folder，搵晒所有 JPG */
function walkJPGs(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Folder not found: ${dir}`);
    process.exit(1);
  }
  return fs.readdirSync(dir)
    .filter(f => /\.(jpg|jpeg)$/i.test(f))
    .map(f => path.join(dir, f))
    .sort();
}

/** 載入之前已成功 upload 嘅 record（for resume） */
function loadDoneSet() {
  try {
    const data = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    return new Set(data.map(r => r.localFile));
  } catch {
    return new Set();
  }
}

/** 儲存 upload result */
function appendLog(entry) {
  let log = [];
  try { log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch {}
  log.push(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
}

/** Upload 一張相去 Cloudinary */
async function uploadOne(filePath) {
  const basename = path.basename(filePath);
  const publicId = path.parse(basename).name;

  const result = await cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    resource_type: 'image',
    overwrite: false    // 唔覆蓋已有嘅
  });

  return {
    localFile: filePath,
    publicId: result.public_id,
    url: result.secure_url,
    bytes: result.bytes,
    format: result.format,
    width: result.width,
    height: result.height
  };
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  const files = walkJPGs(SOURCE_DIR);
  const doneSet = loadDoneSet();

  // Filter out already-uploaded
  const pending = SKIP_EXISTING
    ? files.filter(f => !doneSet.has(f))
    : files;

  console.log(`\n📂 Source: ${SOURCE_DIR}`);
  console.log(`☁️  Cloudinary folder: ${CLOUDINARY_FOLDER}`);
  console.log(`📸 Total JPGs: ${files.length}`);
  console.log(`✅ Already uploaded: ${files.length - pending.length}`);
  console.log(`⏳ Pending: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('🎉 All done! Nothing to upload.');
    return;
  }

  // Parallel upload with concurrency control
  let completed = 0;
  let failed = 0;
  const startTime = Date.now();

  async function worker(file) {
    try {
      const entry = await uploadOne(file);
      appendLog(entry);
      completed++;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((completed + failed) / pending.length * 100).toFixed(1);
      console.log(`[${elapsed}s] [${pct}%] ✅ ${path.basename(file)} → ${entry.url}`);
    } catch (err) {
      failed++;
      completed++; // count as processed
      console.error(`[${Date.now() - startTime}ms] ❌ ${path.basename(file)}: ${err.message}`);
    }
  }

  // Run in batches
  const workers = [];
  for (let i = 0; i < pending.length; i++) {
    workers.push(worker(pending[i]));
    if (workers.length >= CONCURRENCY) {
      await Promise.race(workers);
      // Remove completed workers
      const settled = await Promise.allSettled(
        workers.map((w, idx) => w.then(() => idx))
      );
      const doneIndices = settled
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b - a);
      for (const idx of doneIndices) workers.splice(idx, 1);
    }
  }
  // Wait for remaining
  await Promise.all(workers);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🏁 Done!`);
  console.log(`✅ Success: ${completed - failed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Time: ${totalTime}s`);
  console.log(`📄 Log: ${LOG_FILE}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});