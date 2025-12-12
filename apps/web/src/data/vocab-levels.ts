/**
 * 词汇分级数据 - 基于 ECDICT
 * - basic: 基础词汇（柯林斯 4-5 星，BNC 前 2000，牛津核心词）
 * - advanced: 高级词汇（柯林斯 2-3 星，BNC 2001-6000）
 * - professional: 专业词汇（柯林斯 1 星，BNC 6001-15000）
 */

import vocabData from './vocabulary-data.json'

export type VocabLevel = 'basic' | 'advanced' | 'professional' | 'other'

export interface WordEntry {
  word: string
  phonetic?: string
  meaning: string
  level: VocabLevel
}

interface VocabItem {
  w: string
  m: string
  p?: string
}

interface VocabData {
  basic: Record<string, VocabItem>
  advanced: Record<string, VocabItem>
  professional: Record<string, VocabItem>
}

const data = vocabData as VocabData

/**
 * 查找单词的词汇信息
 */
export function lookupWord(word: string): WordEntry | null {
  const lower = word.toLowerCase()

  // 按优先级查找：basic -> advanced -> professional
  if (data.basic[lower]) {
    const item = data.basic[lower]
    return { word: item.w, meaning: item.m, phonetic: item.p, level: 'basic' }
  }

  if (data.advanced[lower]) {
    const item = data.advanced[lower]
    return { word: item.w, meaning: item.m, phonetic: item.p, level: 'advanced' }
  }

  if (data.professional[lower]) {
    const item = data.professional[lower]
    return { word: item.w, meaning: item.m, phonetic: item.p, level: 'professional' }
  }

  return null
}

/**
 * 判断单词是否应该显示注释
 */
export function shouldAnnotate(
  word: string,
  config: { basic: boolean; advanced: boolean; professional: boolean; other: boolean }
): boolean {
  const entry = lookupWord(word)
  if (!entry) return false

  return (
    (entry.level === 'basic' && config.basic) ||
    (entry.level === 'advanced' && config.advanced) ||
    (entry.level === 'professional' && config.professional)
  )
}

/**
 * 获取词汇统计
 */
export function getVocabStats() {
  return {
    basic: Object.keys(data.basic).length,
    advanced: Object.keys(data.advanced).length,
    professional: Object.keys(data.professional).length,
    total: Object.keys(data.basic).length + Object.keys(data.advanced).length + Object.keys(data.professional).length,
  }
}
