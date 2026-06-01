import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";
import { generateId } from "./commonTools.mjs";

export const getLibraryData = async (dir) => {
  const mdPaths = await globby([`pages/library/${dir}/*.md`], {
    ignore: ["node_modules", ".vitepress"],
  });
  const txtPaths = await globby([`pages/library/${dir}/*.txt`], {
    ignore: ["node_modules", ".vitepress"],
  });
  const pdfPaths = await globby([`pages/library/${dir}/*.pdf`], {
    ignore: ["node_modules", ".vitepress"],
  });

  const mdItems = await Promise.all(
    mdPaths
      .filter((path) => !path.includes("/[") && !path.endsWith("].md"))
      .map(async (path) => {
        const content = await fs.readFile(path, "utf-8");
        const { data } = matter(content);
        const fileName = path.split("/").pop().replace(/\.md$/, "");
        const cats = data.categories;
        return {
          id: generateId(path),
          regularPath: `/pages/library/${dir}/${encodeURIComponent(fileName)}`,
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

  const txtItems = txtPaths
    .filter((path) => !path.includes("/[") && !path.endsWith("].txt"))
    .map((path) => {
      const fileName = path.split("/").pop().replace(/\.txt$/, "");
      return {
        regularPath: `/pages/library/${dir}/view/${encodeURIComponent(fileName)}`,
        title: fileName,
        date: null,
        tags: [],
        categories: [],
        description: "",
        cover: null,
      };
    });

  const pdfItems = pdfPaths
    .filter((path) => !path.includes("/[") && !path.endsWith("].pdf"))
    .map((path) => {
      const fileName = path.split("/").pop().replace(/\.pdf$/, "");
      return {
        regularPath: `/pages/library/${dir}/pdf/${encodeURIComponent(fileName)}`,
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
