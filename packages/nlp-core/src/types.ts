export interface Token {
  text: string
  lemma: string
  pos?: PartOfSpeech
  isWord: boolean
  startOffset: number
  endOffset: number
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'determiner'
  | 'unknown'

export interface DictionaryEntry {
  word: string
  lemma: string
  phonetic?: string
  phoneticUs?: string
  phoneticUk?: string
  audioUrl?: string
  definitions: Definition[]
  examples?: string[]
  wordForms?: WordForm[]
  synonyms?: string[]
  antonyms?: string[]
  frequency?: number
}

export interface Definition {
  partOfSpeech: string
  meaning: string
  meaningCn?: string
  examples?: string[]
}

export interface WordForm {
  form: string
  type: 'plural' | 'past' | 'pastParticiple' | 'presentParticiple' | 'thirdPerson' | 'comparative' | 'superlative'
}

export interface TranslationResult {
  source: string
  translation: string
  detectedLanguage?: string
  provider: string
  confidence?: number
}

export interface DictionaryProvider {
  name: string
  lookup(word: string): Promise<DictionaryEntry | null>
  batchLookup?(words: string[]): Promise<Map<string, DictionaryEntry | null>>
  isOffline?: boolean
}

export interface TranslationProvider {
  name: string
  translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult>
  supportedLanguages?: string[]
  isOffline?: boolean
}
