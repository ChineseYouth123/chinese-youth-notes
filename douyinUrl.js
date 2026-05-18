#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 解析 Markdown 表格行 → 数组
 */
function parseTableRow(row) {
  // 移除首尾的 |，然后按 | 分割，并去除每个单元格的空白
  return row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
}

/**
 * 重建 Markdown 表格行
 */
function buildTableRow(cells) {
  return '| ' + cells.map(c => c.trim()).join(' | ') + ' |';
}

/**
 * 🔥 核心优化：精准提取抖音信息
 */
function extractDouyinInfo(text) {
  if (!text) return null;

  // 1. 提取抖音短链接
  const linkRegex = /https?:\/\/v\.douyin\.com\/[A-Za-z0-9\-_\/]+/g;
  const links = text.match(linkRegex) || [];
  const shortLink = links[0] || '';

  // 如果没有链接，直接返回 null，避免后续无效处理
  if (!shortLink) return null;

  // 2. 提取 #标签 并格式化为 <code> 形式（Markdown 兼容）
  const tagRegex = /#\s*([^\s#]+)/g;
  const tags = [...text.matchAll(tagRegex)].map(m => m[1].trim());
  const categoryHtml = tags.length > 0
    ? tags.map(t => `<code>${t}</code>`).join(' ')
    : '未分类';

  // 3. 精准提取纯净标题
  // 策略：从第一个中文字符开始截取，直到遇到 # 或 http 链接为止
  const titleMatch = text.match(/([\u4e00-\u9fa5][\s\S]*?)(?=\s*#|\s*https?|$)/);
  let title = titleMatch ? titleMatch[1].trim() : '';

  // 清理残余噪声
  title = title
    .replace(/复制此链接.*$/g, '')
    .replace(/^[^\u4e00-\u9fa5\w]+/, '') // 移除首部乱码
    .replace(/[^\u4e00-\u9fa5\w]+$/, '') // 移除尾部乱码
    .replace(/\s+/g, ' ')
    .trim();

  // 智能截断（优先在中文标点处断开，防表格过宽）
  if (title.length > 40) {
    const punctIdx = title.search(/[，。！？、]/);
    title = punctIdx > 0 && punctIdx < 40 
      ? title.slice(0, punctIdx + 1) 
      : title.slice(0, 40) + '...';
  }

  return {
    shortLink,
    allLinks: links,
    title: title || '无标题',
    tags,
    category: categoryHtml
  };
}

/**
 * 判断一行是否是表格分隔线 (Separator Line)
 * 例如: |---|---| 或 |:---|---:|
 */
function isSeparatorLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
  // 检查内部是否只包含 -, :, 空格和 |
  const inner = trimmed.slice(1, -1);
  return /^[\s\-:|]+$/.test(inner);
}

/**
 * 解析 Markdown 中的所有表格
 * 返回结构: [{ headers, rows, startLineIndex, endLineIndex, bodyLinesRef }]
 */
function findAllTables(content) {
  const lines = content.split('\n');
  const tables = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // 1. 寻找潜在的分隔线 (Separator)
    if (isSeparatorLine(line)) {
      // 2. 向上寻找 Header 行
      let headerIdx = i - 1;
      while (headerIdx >= 0 && !lines[headerIdx].trim().startsWith('|')) {
        headerIdx--;
      }
      
      // 如果没找到 Header 或者 Header 不在上一行（中间有空行或非表格内容），则跳过
      if (headerIdx < 0 || headerIdx !== i - 1) {
        i++;
        continue;
      }

      const headerLine = lines[headerIdx];
      const separatorLine = lines[i];
      
      // 3. 向下寻找数据行，直到遇到非表格行
      let dataEndIdx = i + 1;
      while (dataEndIdx < lines.length && lines[dataEndIdx].trim().startsWith('|')) {
        // 如果遇到另一个分隔线，说明当前表格结束，新表格开始（虽然少见，但需处理）
        if (isSeparatorLine(lines[dataEndIdx])) break;
        dataEndIdx++;
      }
      
      // 4. 构建表格对象
      const headers = parseTableRow(headerLine);
      const tableRows = [];
      
      for (let j = i + 1; j < dataEndIdx; j++) {
        const rowLine = lines[j].trim();
        if (!rowLine.startsWith('|')) continue;
        
        const cells = parseTableRow(rowLine);
        // 简单校验：单元格数量应与表头一致（允许误差，但最好一致）
        if (cells.length === headers.length) {
          const rowObj = {};
          headers.forEach((h, idx) => rowObj[h.trim()] = cells[idx] || '');
          rowObj._lineIndex = j;       // 原始行号
          rowObj._cells = cells;       // 原始单元格数组
          tableRows.push(rowObj);
        }
      }

      if (tableRows.length > 0) {
        tables.push({
          headers,
          rows: tableRows,
          startLineIndex: headerIdx,   // 表头起始行
          endLineIndex: dataEndIdx - 1, // 最后一行数据索引
          originalLines: lines         // 引用原始行数组，用于修改
        });
      }
      
      // 跳转到表格结束后的下一行继续搜索
      i = dataEndIdx;
    } else {
      i++;
    }
  }
  
  return tables;
}

/**
 * 主函数：读取 → 解析所有表格 → 填充 → 写回 Markdown
 * @param {string} filePath 
 * @param {string|null} outputPath 
 * @param {object} config - 配置项，如列名映射
 */
function fillBlogTable(filePath, outputPath = null, config = {}) {
  const defaultConfig = {
    sourceCol: '完整链接',   // 源数据列名
    targetCols: {            // 目标列名映射: { 目标列名: 提取字段名 }
      '分类': 'category',
      'url标题': 'title',
      '链接': 'shortLink'
    }
  };
  
  const cfg = { ...defaultConfig, ...config };
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: body, emptySeparator } = matter(fileContent);
  
  console.log('📋 读取文件:', filePath);
  
  // 1. 查找所有表格
  const tables = findAllTables(body);
  
  if (tables.length === 0) {
    console.warn('⚠️ 未找到任何有效的 Markdown 表格');
    return { filledCount: 0 };
  }
  
  console.log(`🔍 发现 ${tables.length} 个表格`);
  
  let totalFilledCount = 0;
  const bodyLines = body.split('\n'); // 我们将基于这个数组进行修改

  // 2. 遍历每个表格进行处理
  tables.forEach((table, tableIdx) => {
    console.log(`\n--- 处理第 ${tableIdx + 1} 个表格 (行 ${table.startLineIndex + 1}-${table.endLineIndex + 1}) ---`);
    
    const { headers, rows } = table;
    
    // 确定列索引
    const sourceColIndex = headers.indexOf(cfg.sourceCol);
    if (sourceColIndex === -1) {
      console.log(`ℹ️ 跳过表格 ${tableIdx + 1}: 缺少源列 [${cfg.sourceCol}]`);
      return;
    }

    let tableFilledCount = 0;

    for (const row of rows) {
      const fullText = row[cfg.sourceCol] || '';
      if (!fullText.trim()) continue;

      const info = extractDouyinInfo(fullText);
      if (!info) continue; // 没有提取到有效信息

      const newCells = [...row._cells];
      let hasChange = false;

      // 根据配置映射填充目标列
      for (const [targetHeader, fieldKey] of Object.entries(cfg.targetCols)) {
        const targetIdx = headers.indexOf(targetHeader);
        if (targetIdx !== -1 && info[fieldKey]) {
          newCells[targetIdx] = info[fieldKey];
          hasChange = true;
        }
      }

      if (hasChange) {
        // 更新内存中的行内容
        bodyLines[row._lineIndex] = buildTableRow(newCells);
        tableFilledCount++;
        console.log(`✅ [行 ${row._lineIndex + 1}] 标题: ${info.title.substring(0, 15)}...`);
      }
    }
    
    totalFilledCount += tableFilledCount;
    console.log(`📊 表格 ${tableIdx + 1} 完成: 填充 ${tableFilledCount} 行`);
  });

  // 3. 重新组合内容并写入
  const newBody = bodyLines.join('\n');
  const newContent = matter.stringify(newBody, frontmatter, {
    delimiters: emptySeparator ? ['---', '---'] : undefined
  });

  const targetPath = outputPath || filePath.replace('.md', '.filled.md');
  fs.writeFileSync(targetPath, newContent, 'utf-8');
  
  console.log(`\n🎉 全部完成！共填充 ${totalFilledCount} 行\n💾 输出: ${targetPath}`);
  return { filledCount: totalFilledCount, outputPath: targetPath };
}

// ============ 执行入口 ============
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const targetFile = process.argv[2] || './blog.md';
  try { 
    fillBlogTable(targetFile, process.argv[3]); 
  } 
  catch (err) { 
    console.error('❌ 处理失败:', err.message); 
    console.error(err.stack);
    process.exit(1); 
  }
}

export { fillBlogTable, extractDouyinInfo };