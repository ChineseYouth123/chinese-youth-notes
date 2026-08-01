import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";
import { generateId } from "./commonTools.mjs";

/**
 * 读取 pages/categories 目录下的所有 Markdown 文件，
 * 按文件创建日期降序排列（新建的文件排在最前）。
 * @param {string} basePath - 目录路径
 * @returns {Promise<Array>} 文件数据列表
 */
export const getCategoriesFiles = async (basePath = "pages/categories") => {
  const mdPaths = await globby([`${basePath}/*.md`], {
    ignore: ["node_modules", ".vitepress"],
  });

  const items = await Promise.all(
    mdPaths
      .filter((path) => !path.includes("/[") && !path.endsWith("].md"))
      .map(async (path) => {
        const content = await fs.readFile(path, "utf-8");
        const { data } = matter(content);
        const fileName = path.split("/").pop().replace(/\.md$/, "");
        const stat = await fs.stat(path);
        return {
          id: generateId(path),
          regularPath: `/${basePath}/${encodeURIComponent(fileName)}`,
          title: data.title || fileName,
          date: data.date ? new Date(data.date).getTime() : null,
          // 创建时间（Linux 下 birthtime 不可靠时回退到状态变更时间）
          createdAt: stat.birthtimeMs || stat.ctimeMs || stat.mtimeMs,
          lastModified: stat.mtimeMs,
          tags: data.tags || [],
          categories: Array.isArray(data.categories)
            ? data.categories
            : data.categories
              ? [data.categories]
              : [],
          description: data.description || "",
          cover: data.cover || null,
        };
      }),
  );

  // 按文件创建日期降序排列（新建在前）
  return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};
