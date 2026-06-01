import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";
import { generateId } from "./commonTools.mjs";

export const getAllMaterials = async () => {
  const mdPaths = await globby(["pages/library/materials/*.md"], {
    ignore: ["node_modules", ".vitepress"],
  });
  const txtPaths = await globby(["pages/library/materials/*.txt"], {
    ignore: ["node_modules", ".vitepress"],
  });
  const pdfPaths = await globby(["pages/library/materials/*.pdf"], {
    ignore: ["node_modules", ".vitepress"],
  });

  const mdItems = await Promise.all(
    mdPaths.map(async (path) => {
      const content = await fs.readFile(path, "utf-8");
      const { data } = matter(content);
      const fileName = path.split("/").pop().replace(/\.md$/, "");
      const cats = data.categories;
      return {
        id: generateId(path),
        regularPath: `/pages/library/materials/${encodeURIComponent(fileName)}`,
        title: data.title || fileName,
        date: data.date ? new Date(data.date).getTime() : null,
        lastModified: (await fs.stat(path)).mtimeMs,
        tags: data.tags || [],
        categories: Array.isArray(cats) ? cats : cats ? [cats] : [],
        description: data.description || "",
        cover: data.cover || null,
      };
    }),
  );

  const txtItems = txtPaths.map((path) => {
    const fileName = path.split("/").pop().replace(/\.txt$/, "");
    return {
      regularPath: `/pages/library/materials/view/${encodeURIComponent(fileName)}`,
      title: fileName,
      date: null,
      tags: [],
      categories: [],
      description: "",
      cover: null,
    };
  });

  const pdfItems = pdfPaths.map((path) => {
    const fileName = path.split("/").pop().replace(/\.pdf$/, "");
    return {
      regularPath: `/pages/library/materials/pdf/${encodeURIComponent(fileName)}`,
      title: fileName,
      date: null,
      tags: [],
      categories: [],
      description: "",
      cover: null,
    };
  });

  return [...mdItems, ...txtItems, ...pdfItems].sort(
    (a, b) => (b.date || 0) - (a.date || 0),
  );
};
