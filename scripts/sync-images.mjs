import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream } from "fs";
import { readdir, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import pkg from "pinyin";
const { pinyin } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MD_DIR = path.join(ROOT, "pages", "library", "maozedong");

const CDN_RE = /https:\/\/cdn-mineru\.openxlab\.org\.cn\/result\/[^\s)"']+\.(jpg|jpeg|png|webp|gif|bmp)/gi;

const STRIP_TONE = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const toPinyinDir = (name) => {
  const noExt = name.replace(/\.md$/i, "");
  const py = pinyin(noExt);
  return STRIP_TONE(py.map((a) => a[0]).join("-")) + "-images";
};

const CONCURRENCY = 5;

async function download(url, dest) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const writer = createWriteStream(dest);
  return new Promise((resolve, reject) => {
    res.body.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function processFile(filePath) {
  const baseName = path.basename(filePath);
  const dirName = toPinyinDir(baseName);
  const imgDir = path.join(path.dirname(filePath), dirName);
  const mappingFile = path.join(imgDir, ".mapping.json");

  let raw = readFileSync(filePath, "utf-8");
  const urls = [...raw.matchAll(CDN_RE)].map((m) => m[0]);
  if (!urls.length) {
    console.log(`  [SKIP] ${baseName} — no CDN images found`);
    return;
  }

  if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

  let mapping = {};
  if (existsSync(mappingFile)) {
    mapping = JSON.parse(readFileSync(mappingFile, "utf-8"));
  }

  const toDownload = [...new Set(urls)].filter((u) => !(u in mapping));
  const existingUrls = [...new Set(urls)].filter((u) => u in mapping);

  if (toDownload.length) {
    console.log(`  [DL]   ${baseName} — ${toDownload.length} new images`);
    let nextId = Object.keys(mapping).length + 1;

    const queue = [...toDownload];
    async function worker() {
      while (queue.length) {
        const url = queue.shift();
        const ext = path.extname(new URL(url).pathname) || ".jpg";
        const fname = String(nextId++).padStart(3, "0") + ext;
        const dest = path.join(imgDir, fname);
        try {
          await download(url, dest);
          mapping[url] = fname;
          console.log(`    ✔ ${fname}`);
        } catch (err) {
          console.log(`    ✗ ${fname} — ${err.message}`);
        }
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, toDownload.length) }, worker);
    await Promise.all(workers);
  }

  if (existingUrls.length) {
    console.log(`  [CACHE] ${baseName} — ${existingUrls.length} cached`);
  }

  if (toDownload.length) {
    writeFileSync(mappingFile, JSON.stringify(mapping, null, 2), "utf-8");
  }

  let replacedCount = 0;
  let result = raw;
  for (const [cdnUrl, fname] of Object.entries(mapping)) {
    const localPath = `./${dirName}/${fname}`;
    const escaped = cdnUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "g");
    const newResult = result.replace(re, localPath);
    if (newResult !== result) {
      replacedCount += (result.match(re) || []).length;
      result = newResult;
    }
  }

  if (replacedCount) {
    writeFileSync(filePath, result, "utf-8");
    console.log(`  [REPLACE] ${baseName} — ${replacedCount} URLs replaced`);
  }
}

async function main() {
  console.log("\n=== Sync Images ===\n");
  if (!existsSync(MD_DIR)) {
    console.log(`Directory not found: ${MD_DIR}`);
    return;
  }
  const files = (await readdir(MD_DIR)).filter((f) => f.endsWith(".md"));
  if (!files.length) {
    console.log("No markdown files found.");
    return;
  }
  for (const f of files) {
    await processFile(path.join(MD_DIR, f));
  }
  console.log("\n=== Done ===\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
