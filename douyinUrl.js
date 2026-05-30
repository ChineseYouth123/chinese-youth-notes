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

  if (!shortLink) return null;

  // 2. 提取 #标签
  const tagRegex = /#\s*([^\s#]+)/g;
  const tags = [...text.matchAll(tagRegex)].map(m => m[1].trim());
  const categoryHtml = tags.length > 0
    ? tags.map(t => `<code>${t}</code>`).join(' ')
    : '未分类';

  // 3. 精准提取纯净标题
  const titleMatch = text.match(/([\u4e00-\u9fa5][\s\S]*?)(?=\s*#|\s*https?|$)/);
  let title = titleMatch ? titleMatch[1].trim() : '';

  // 清理噪声
  title = title
    .replace(/复制此链接.*$/g, '')
    .replace(/^[^\u4e00-\u9fa5\w]+/, '') 
    .replace(/[^\u4e00-\u9fa5\w]+$/, '') 
    .replace(/\s+/g, ' ')
    .trim();

  // 智能截断
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
 * 判断一行是否是表格分隔线
 */
function isSeparatorLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
  const inner = trimmed.slice(1, -1);
  return /^[\s\-:|]+$/.test(inner);
}

/**
 * 解析 Markdown 中的所有表格
 */
function findAllTables(content) {
  const lines = content.split('\n');
  const tables = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    if (isSeparatorLine(line)) {
      let headerIdx = i - 1;
      while (headerIdx >= 0 && !lines[headerIdx].trim().startsWith('|')) {
        headerIdx--;
      }
      
      if (headerIdx < 0 || headerIdx !== i - 1) {
        i++;
        continue;
      }

      const headerLine = lines[headerIdx];
      
      let dataEndIdx = i + 1;
      while (dataEndIdx < lines.length && lines[dataEndIdx].trim().startsWith('|')) {
        if (isSeparatorLine(lines[dataEndIdx])) break;
        dataEndIdx++;
      }
      
      const headers = parseTableRow(headerLine);
      const tableRows = [];
      
      for (let j = i + 1; j < dataEndIdx; j++) {
        const rowLine = lines[j].trim();
        if (!rowLine.startsWith('|')) continue;
        
        const cells = parseTableRow(rowLine);
        // 允许单元格数量略多于表头（防止因分割错误导致错位，但通常应一致）
        // 这里严格匹配长度以确保映射正确
        if (cells.length === headers.length) {
          const rowObj = {};
          headers.forEach((h, idx) => rowObj[h.trim()] = cells[idx] || '');
          rowObj._lineIndex = j;       
          rowObj._cells = cells;       
          tableRows.push(rowObj);
        }
      }

      if (tableRows.length > 0) {
        tables.push({
          headers,
          rows: tableRows,
          startLineIndex: headerIdx,   
          endLineIndex: dataEndIdx - 1, 
          originalLines: lines         
        });
      }
      
      i = dataEndIdx;
    } else {
      i++;
    }
  }
  
  return tables;
}

/**
 * 处理单个文件：读取 -> 解析 -> 填充 -> 加序号 -> 写回
 */
function fillBlogTable(filePath, outputPath = null, config = {}) {
  const defaultConfig = {
    sourceCol: '完整链接',   // 源数据列名
    seqCol: '序号',         // 序号列名
    targetCols: {            // 目标列名映射
      '分类': 'category',
      'url标题': 'title',
      '链接': 'shortLink'
    },
    addSeqIfMissing: true   // 如果表中没有序号列，是否自动添加
  };
  
  const cfg = { ...defaultConfig, ...config };
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: body, emptySeparator } = matter(fileContent);
  
  // 1. 查找所有表格
  const tables = findAllTables(body);
  
  if (tables.length === 0) {
    // console.warn(`⚠️ [${path.basename(filePath)}] 未找到有效表格`);
    return { filledCount: 0, skipped: true };
  }
  
  let totalFilledCount = 0;
  const bodyLines = body.split('\n'); 

  // 2. 遍历每个表格
  tables.forEach((table, tableIdx) => {
    const { headers, rows } = table;
    
    // --- 步骤 A: 处理序号列 ---
    let seqColIndex = headers.indexOf(cfg.seqCol);
    let hasSeqCol = seqColIndex !== -1;

    // 如果需要添加序号列且当前没有
    if (!hasSeqCol && cfg.addSeqIfMissing) {
      // 1. 修改表头：在最前面插入 "序号"
      const newHeaders = [cfg.seqCol, ...headers];
      bodyLines[table.startLineIndex] = buildTableRow(newHeaders);
      
      // 2. 修改分隔线：在最前面插入 "---"
      // 找到对应的分隔线行 (startLineIndex + 1)
      const sepLineIdx = table.startLineIndex + 1;
      if (sepLineIdx < bodyLines.length && isSeparatorLine(bodyLines[sepLineIdx])) {
         const oldSepCells = parseTableRow(bodyLines[sepLineIdx]);
         const newSepCells = ['---', ...oldSepCells];
         bodyLines[sepLineIdx] = buildTableRow(newSepCells);
      }

      // 3. 更新内存中的 headers 引用，以便后续逻辑使用新的索引
      // 注意：此时 bodyLines 已经改变，但 table.headers 还是旧的，我们需要手动维护逻辑
      // 为了简化，我们重新计算索引，或者在后续循环中动态调整
      
      // 标记已添加，并更新局部变量
      hasSeqCol = true;
      seqColIndex = 0; // 新加的在第一列
      
      // 重要：因为我们在 bodyLines 中插入了列，现有的 row._cells 需要扩容
      // 但更简单的方法是：我们在生成最终行字符串时，手动拼接序号
    }

    // --- 步骤 B: 确定源列和目标列索引 ---
    // 如果刚才添加了序号列，headers 数组在内存中没变，但实际文件变了。
    // 为了稳健，我们基于当前的 headers (原始解析的) 来查找源列。
    // 如果添加了序号列，源列的实际物理索引会 +1。
    
    const sourceColIndexInHeader = headers.indexOf(cfg.sourceCol);
    if (sourceColIndexInHeader === -1) {
      // console.log(`ℹ️ 跳过表格: 缺少源列 [${cfg.sourceCol}]`);
      return;
    }

    // 计算实际在 bodyLines 行中的索引
    // 如果添加了序号列，所有原有列的索引都 +1
    const offset = (hasSeqCol && cfg.addSeqIfMissing && seqColIndex === 0 && headers.indexOf(cfg.seqCol) === -1) ? 1 : 0;
    const actualSourceIdx = sourceColIndexInHeader + offset;

    let tableFilledCount = 0;
    let currentSeq = 1; // 序号计数器

    for (const row of rows) {
      // 获取源文本
      // 注意：row._cells 是解析时的旧数据。如果表结构变了（加了列），row._cells 长度不对。
      // 最安全的方式：直接从 bodyLines 重新解析该行，或者依赖 row._cells 并在输出时修正。
      // 鉴于我们只修改内容不删除行，且只在头部加列，我们可以这样处理：
      
      let fullText = '';
      if (offset === 0) {
        fullText = row[cfg.sourceCol] || '';
      } else {
        // 如果加了列，row 对象里的 key 还是旧的 header name，所以可以直接用 key 取值
        fullText = row[cfg.sourceCol] || '';
      }

      if (!fullText.trim()) {
        currentSeq++; // 即使空行也占一个序号？通常不需要，看需求。这里假设空行不计数或保持原样。
        // 如果希望空行也有序号，取消下面的 continue 前的 currentSeq++ 逻辑调整
        continue; 
      }

      const info = extractDouyinInfo(fullText);
      if (!info) {
        currentSeq++;
        continue; 
      }

      // 构建新行单元格
      // 1. 获取原始单元格副本
      let newCells = [...row._cells];
      
      // 2. 如果之前添加了序号列，需要在数组最前面插入序号
      if (offset === 1) {
        newCells.unshift(String(currentSeq));
      } else if (hasSeqCol) {
        // 如果原本就有序号列，更新它
        newCells[seqColIndex] = String(currentSeq);
      }

      // 3. 填充其他目标列
      // 注意：如果 offset=1，目标列的物理索引也要 +1
      for (const [targetHeader, fieldKey] of Object.entries(cfg.targetCols)) {
        const targetIdxInHeader = headers.indexOf(targetHeader);
        if (targetIdxInHeader !== -1 && info[fieldKey]) {
          const actualTargetIdx = targetIdxInHeader + offset;
          // 确保数组长度足够（防止越界，虽然理论上应该一致）
          if (actualTargetIdx < newCells.length) {
             newCells[actualTargetIdx] = info[fieldKey];
          }
        }
      }

      // 4. 更新行
      bodyLines[row._lineIndex] = buildTableRow(newCells);
      
      tableFilledCount++;
      currentSeq++;
    }
    
    totalFilledCount += tableFilledCount;
  });

  if (totalFilledCount === 0) {
     return { filledCount: 0, skipped: true };
  }

  // 3. 写回文件
  const newBody = bodyLines.join('\n');
  const newContent = matter.stringify(newBody, frontmatter, {
    delimiters: emptySeparator ? ['---', '---'] : undefined
  });

  const targetPath = outputPath || filePath; // 默认覆盖原文件，或者你可以改为 .filled.md
  fs.writeFileSync(targetPath, newContent, 'utf-8');
  
  return { filledCount: totalFilledCount, outputPath: targetPath };
}

/**
 * 递归获取目录下所有 .md 文件
 */
function getAllMdFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllMdFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * 主入口：处理文件或文件夹
 */
function main() {
  const targetPath = process.argv[2] || './blogs'; // 默认当前目录下的 blogs 文件夹或文件
  const customOutputDir = process.argv[3]; // 可选：指定输出目录，如果不指定则覆盖原文件

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ 路径不存在: ${targetPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(targetPath);
  let filesToProcess = [];

  if (stats.isDirectory()) {
    console.log(`📂 扫描目录: ${targetPath}`);
    filesToProcess = getAllMdFiles(targetPath);
  } else {
    filesToProcess = [targetPath];
  }

  if (filesToProcess.length === 0) {
    console.log('ℹ️ 没有找到任何 .md 文件');
    return;
  }

  console.log(`🚀 开始处理 ${filesToProcess.length} 个文件...\n`);

  let totalGlobalFilled = 0;
  let successCount = 0;
  let skipCount = 0;

  filesToProcess.forEach((filePath, index) => {
    console.log(`[${index + 1}/${filesToProcess.length}] 处理: ${path.basename(filePath)}`);
    
    let outPath = filePath;
    if (customOutputDir) {
      // 如果指定了输出目录，保持相对路径结构
      const relativePath = path.relative(path.dirname(targetPath), filePath);
      outPath = path.join(customOutputDir, relativePath);
      // 确保输出目录存在
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
    }

    try {
      const result = fillBlogTable(filePath, outPath);
      if (result && !result.skipped) {
        totalGlobalFilled += result.filledCount;
        successCount++;
        console.log(`   ✅ 完成: 填充 ${result.filledCount} 行\n`);
      } else {
        skipCount++;
        console.log(`   ⏭️  跳过: 无有效数据或表格\n`);
      }
    } catch (err) {
      console.error(`   ❌ 失败: ${err.message}`);
    }
  });

  console.log('\n========================================');
  console.log(`🎉 全部任务结束！`);
  console.log(`📊 统计: 成功 ${successCount} 个文件, 跳过 ${skipCount} 个文件`);
  console.log(`📝 总共填充行数: ${totalGlobalFilled}`);
  if (customOutputDir) {
    console.log(`💾 输出目录: ${customOutputDir}`);
  } else {
    console.log(`💾 模式: 覆盖原文件`);
  }
  console.log('========================================');
}

// 执行
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    main();
  } catch (err) {
    console.error('❌ 程序异常:', err);
    process.exit(1);
  }
}

export { fillBlogTable, extractDouyinInfo };