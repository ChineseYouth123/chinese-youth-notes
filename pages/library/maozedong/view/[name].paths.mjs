import fs from "fs";
import path from "path";

export default {
  paths() {
    const dir = "pages/library/maozedong";
    if (!fs.existsSync(dir)) return [];
    const pages = [];
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry.endsWith(".txt")) {
        pages.push({ params: { name: path.parse(entry).name } });
      }
    }
    console.info("文本文件动态路由：", pages);
    return pages;
  },
};
