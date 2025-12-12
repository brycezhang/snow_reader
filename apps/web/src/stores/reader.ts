import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type VocabLevel = 'basic' | 'advanced' | 'professional' | 'other'
export type ColorScheme = 'greenCalm' | 'vintageBrown' | 'tealModern' | 'mintPaper'

export interface VocabLevelConfig {
  basic: boolean
  advanced: boolean
  professional: boolean
  other: boolean
}

export interface ColorSchemeConfig {
  name: string
  label: string
  bg: string
  text: string
  accent: string
  sidebar: string
}

export const COLOR_SCHEMES: Record<ColorScheme, ColorSchemeConfig> = {
  greenCalm: {
    name: 'greenCalm',
    label: 'Green Calm',
    bg: '#f5f9f5',
    text: '#2d3a2d',
    accent: '#4a7c59',
    sidebar: '#3d5a45',
  },
  vintageBrown: {
    name: 'vintageBrown',
    label: 'Vintage Brown',
    bg: '#f8f4e8',
    text: '#3d3427',
    accent: '#8b7355',
    sidebar: '#5c4a3a',
  },
  tealModern: {
    name: 'tealModern',
    label: 'Teal Modern',
    bg: '#f0f7f7',
    text: '#1a3a3a',
    accent: '#2a7a7a',
    sidebar: '#1a4a4a',
  },
  mintPaper: {
    name: 'mintPaper',
    label: 'Mint Paper',
    bg: '#f5faf8',
    text: '#2d3d35',
    accent: '#5a9a7a',
    sidebar: '#3a5a4a',
  },
}

export const useReaderStore = defineStore('reader', () => {
  // 当前书籍信息
  const bookTitle = ref('')
  const bookAuthor = ref('')
  const currentChapter = ref('')
  const currentChapterIndex = ref(0)
  const totalChapters = ref(0)
  const progress = ref(0)

  // 目录
  const toc = ref<{ label: string; href: string; level: number }[]>([])

  // 配色方案
  const colorScheme = ref<ColorScheme>('tealModern')
  const currentColorScheme = computed(() => COLOR_SCHEMES[colorScheme.value])

  // 词汇注释级别
  const vocabLevels = ref<VocabLevelConfig>({
    basic: true,
    advanced: true,
    professional: false,
    other: false,
  })

  // 阅读偏好
  const fontSize = ref(18)
  const lineHeight = ref(1.8)
  const pageMargin = ref(60)
  const fontFamily = ref('serif')

  // 可用字体
  const FONT_FAMILIES = [
    { value: 'serif', label: '衬线体', css: 'Georgia, "Times New Roman", serif' },
    { value: 'sans-serif', label: '无衬线', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { value: 'monospace', label: '等宽体', css: 'Menlo, Monaco, "Courier New", monospace' },
  ] as const

  // 方法
  const setBook = (title: string, author: string) => {
    bookTitle.value = title
    bookAuthor.value = author
  }

  const setToc = (items: { label: string; href: string; level: number }[]) => {
    toc.value = items
    totalChapters.value = items.length
  }

  const setCurrentChapter = (index: number, title: string) => {
    currentChapterIndex.value = index
    currentChapter.value = title
  }

  const setProgress = (value: number) => {
    progress.value = value
  }

  const setColorScheme = (scheme: ColorScheme) => {
    colorScheme.value = scheme
    localStorage.setItem('snow-reader-color-scheme', scheme)
  }

  const toggleVocabLevel = (level: VocabLevel) => {
    vocabLevels.value[level] = !vocabLevels.value[level]
    localStorage.setItem('snow-reader-vocab-levels', JSON.stringify(vocabLevels.value))
  }

  const setVocabLevel = (level: VocabLevel, enabled: boolean) => {
    vocabLevels.value[level] = enabled
    localStorage.setItem('snow-reader-vocab-levels', JSON.stringify(vocabLevels.value))
  }

  const setFontFamily = (font: string) => {
    fontFamily.value = font
    localStorage.setItem('snow-reader-font-family', font)
  }

  const setFontSize = (size: number) => {
    fontSize.value = size
    localStorage.setItem('snow-reader-font-size', String(size))
  }

  const getCurrentFontCSS = () => {
    const font = FONT_FAMILIES.find((f) => f.value === fontFamily.value)
    return font?.css || FONT_FAMILIES[0].css
  }

  // 初始化
  const initFromStorage = () => {
    const savedScheme = localStorage.getItem('snow-reader-color-scheme') as ColorScheme | null
    if (savedScheme && savedScheme in COLOR_SCHEMES) {
      colorScheme.value = savedScheme
    }

    const savedLevels = localStorage.getItem('snow-reader-vocab-levels')
    if (savedLevels) {
      try {
        vocabLevels.value = JSON.parse(savedLevels)
      } catch {
        // ignore
      }
    }

    const savedFont = localStorage.getItem('snow-reader-font-family')
    if (savedFont) {
      fontFamily.value = savedFont
    }

    const savedFontSize = localStorage.getItem('snow-reader-font-size')
    if (savedFontSize) {
      fontSize.value = parseInt(savedFontSize, 10) || 18
    }
  }

  return {
    // 状态
    bookTitle,
    bookAuthor,
    currentChapter,
    currentChapterIndex,
    totalChapters,
    progress,
    toc,
    colorScheme,
    currentColorScheme,
    vocabLevels,
    fontSize,
    lineHeight,
    pageMargin,
    fontFamily,
    FONT_FAMILIES,
    // 方法
    setBook,
    setToc,
    setCurrentChapter,
    setProgress,
    setColorScheme,
    toggleVocabLevel,
    setVocabLevel,
    setFontFamily,
    setFontSize,
    getCurrentFontCSS,
    initFromStorage,
  }
})
