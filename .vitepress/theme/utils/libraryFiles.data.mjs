import fs from "fs";
import path from "path";

export default {
  watch: ["public/pages/library/*/*.pdf"],
  load(watchedFiles) {
    const categories = {
      "red-books": "/pages/library/red-books/pdf/",
      maozedong: "/pages/library/maozedong/pdf/",
      materials: "/pages/library/materials/pdf/",
    };
    const result = { "red-books": [], maozedong: [], materials: [] };
    for (const filePath of watchedFiles) {
      const match = filePath.match(/public\/pages\/library\/([^/]+)\//);
      if (!match) continue;
      const key = match[1];
      if (!categories[key]) continue;
      const name = path.parse(filePath).name;
      result[key].push({
        name,
        link: categories[key] + encodeURIComponent(name),
        ext: ".pdf",
      });
    }
    return result;
  },
};
