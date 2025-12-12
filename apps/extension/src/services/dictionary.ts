import type { MessageResponse } from '../types/message'

export interface DictionaryEntry {
  word: string
  lemma: string
  phonetic?: string
  definitions: {
    partOfSpeech: string
    meaning: string
    meaningCn?: string
  }[]
  examples?: string[]
}

export class DictionaryService {
  private cache = new Map<string, DictionaryEntry>()
  private apiBase = 'http://localhost:4000/api'

  async lookup(word: string): Promise<MessageResponse<DictionaryEntry>> {
    const lemma = word.toLowerCase()

    if (this.cache.has(lemma)) {
      return { success: true, data: this.cache.get(lemma) }
    }

    try {
      const response = await fetch(`${this.apiBase}/dictionary/${encodeURIComponent(lemma)}`)

      if (!response.ok) {
        return { success: false, error: 'Word not found' }
      }

      const data: DictionaryEntry = await response.json()
      this.cache.set(lemma, data)

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  clearCache() {
    this.cache.clear()
  }
}
