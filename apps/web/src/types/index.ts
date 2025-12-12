export interface Book {
  id: string
  title: string
  author: string
  cover?: string
  publicationUrl: string
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  title: string
  sourceUrl: string
  content: string
  readingTime: number
  createdAt: string
  updatedAt: string
}

export interface ReadingPosition {
  id: string
  bookId?: string
  articleId?: string
  cfi?: string
  anchor?: string
  percentage: number
  updatedAt: string
}

export interface Highlight {
  id: string
  bookId?: string
  articleId?: string
  cfi?: string
  xpath?: string
  offset?: number
  text: string
  color: string
  tags: string[]
  createdAt: string
}

export interface Note {
  id: string
  highlightId: string
  text: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface VocabItem {
  id: string
  lemma: string
  displayWord: string
  bookId?: string
  articleId?: string
  masteryLevel: number
  contextSnippet?: string
  createdAt: string
  updatedAt: string
}

export interface DictionaryEntry {
  word: string
  lemma: string
  phonetic?: string
  audioUrl?: string
  definitions: DictionaryDefinition[]
  examples?: string[]
  wordForms?: WordForm[]
}

export interface DictionaryDefinition {
  partOfSpeech: string
  meaning: string
  meaningCn?: string
}

export interface WordForm {
  form: string
  type: string
}

export interface TranslationResult {
  source: string
  translation: string
  provider: string
}

export interface ReaderPreferences {
  fontSize: number
  lineHeight: number
  margin: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
}
