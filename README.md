# photo-website

Quiet Frame — 個人攝影作品網站

## 🚀 架構

- **GitHub Pages** — hosting 網站 code（HTML/CSS/JS）
- **Cloudinary** — hosting 所有相片（CDN 加速）
- **`generate-from-cloudinary.js`** — 從 Cloudinary API 自動生成 `photos-data.js`

## 📦 安裝

```bash
npm install
```

## 📤 Upload 新相

1. 將新相 upload 上 Cloudinary（可用 `upload-to-cloudinary.js`）
2. Run `node generate-from-cloudinary.js` 更新相片資料
3. Commit & push 返 GitHub

## 🗂️ 檔案

| 檔案 | 用途 |
|------|------|
| `index.html` | 主頁面 |
| `style.css` | 樣式表 |
| `script.js` | JavaScript 功能 |
| `photos-data.js` | 相片資料（自動生成，指向 Cloudinary URL） |
| `generate-from-cloudinary.js` | 從 Cloudinary 攞相片資料 |
| `upload-to-cloudinary.js` | Batch upload 相片上 Cloudinary |
| `generate-gallery.js` | （舊版）Scan local images 出 Cloudinary URL |