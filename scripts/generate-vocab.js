/**
 * 从 ECDICT CSV 生成精简版词汇表
 * 
 * 分级规则：
 * - basic: collins >= 4 或 bnc <= 2000（约 3000 词）
 * - advanced: collins 2-3 或 bnc 2001-6000（约 4000 词）
 * - professional: collins 1 或 bnc 6001-15000（约 5000 词）
 * - other: bnc > 15000
 */

import { createReadStream } from 'fs'
import { writeFile } from 'fs/promises'
import { createInterface } from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const INPUT_FILE = join(__dirname, '../dict/ECDICT-1.0.28/ecdict.csv')
const OUTPUT_FILE = join(__dirname, '../apps/web/src/data/vocabulary-data.json')

// 只保留常用单词（排除专有名词、缩写等）
const isValidWord = (word) => {
  if (!word || word.length < 2 || word.length > 20) return false
  if (/[^a-zA-Z]/.test(word)) return false // 只保留纯英文单词
  if (word[0] === word[0].toUpperCase()) return false // 排除大写开头（专有名词）
  return true
}

// 简化中文释义（只取第一个释义）
const simplifyTranslation = (translation) => {
  if (!translation) return ''
  
  // 移除词性标记如 "n. ", "v. " 等
  let text = translation.replace(/^[a-z]+\.\s*/i, '')
  
  // 只取第一个释义（用逗号、分号、换行分隔）
  text = text.split(/[,;，；\n]/)[0].trim()
  
  // 移除括号内容
  text = text.replace(/[（(][^)）]*[)）]/g, '').trim()
  
  // 限制长度
  if (text.length > 10) {
    text = text.substring(0, 10)
  }
  
  return text
}

// 确定词汇级别
const getLevel = (collins, bnc, oxford) => {
  const bncNum = parseInt(bnc) || 99999
  const collinsNum = parseInt(collins) || 0
  const isOxford = oxford === '1'
  
  // 基础词汇：柯林斯 4-5 星，或 BNC 前 2000，或牛津核心词
  if (collinsNum >= 4 || bncNum <= 2000 || isOxford) {
    return 'basic'
  }
  
  // 高级词汇：柯林斯 2-3 星，或 BNC 2001-6000
  if (collinsNum >= 2 || bncNum <= 6000) {
    return 'advanced'
  }
  
  // 专业词汇：柯林斯 1 星，或 BNC 6001-15000
  if (collinsNum >= 1 || bncNum <= 15000) {
    return 'professional'
  }
  
  return 'other'
}

async function main() {
  console.log('开始处理 ECDICT...')
  
  const vocab = {
    basic: {},
    advanced: {},
    professional: {},
  }
  
  const stats = { total: 0, basic: 0, advanced: 0, professional: 0, skipped: 0 }
  
  const rl = createInterface({
    input: createReadStream(INPUT_FILE, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })
  
  let isHeader = true
  let headers = []
  
  for await (const line of rl) {
    if (isHeader) {
      headers = line.split(',')
      isHeader = false
      continue
    }
    
    // 简单 CSV 解析（处理引号内的逗号）
    const values = []
    let current = ''
    let inQuotes = false
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current)
    
    const row = {}
    headers.forEach((h, i) => {
      row[h] = values[i] || ''
    })
    
    const word = row.word?.toLowerCase()
    
    if (!isValidWord(word)) {
      stats.skipped++
      continue
    }
    
    const translation = simplifyTranslation(row.translation)
    if (!translation) {
      stats.skipped++
      continue
    }
    
    const level = getLevel(row.collins, row.bnc, row.oxford)
    
    // 只保留 basic/advanced/professional，跳过 other
    if (level === 'other') {
      stats.skipped++
      continue
    }
    
    // 避免重复
    if (vocab[level][word]) {
      continue
    }
    
    vocab[level][word] = {
      w: word,
      m: translation,
      p: row.phonetic || undefined,
    }
    
    stats[level]++
    stats.total++
    
    // 限制每级词汇数量
    if (stats.basic > 5000 && stats.advanced > 8000 && stats.professional > 10000) {
      break
    }
  }
  
  console.log('统计:', stats)
  
  // 写入 JSON 文件
  await writeFile(OUTPUT_FILE, JSON.stringify(vocab, null, 0), 'utf-8')
  
  console.log(`已生成: ${OUTPUT_FILE}`)
  console.log(`文件大小: ${(JSON.stringify(vocab).length / 1024 / 1024).toFixed(2)} MB`)
}

main().catch(console.error)
