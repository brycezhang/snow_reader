import type { MessageResponse } from '../types/message'

export interface TranslationResult {
  source: string
  translation: string
  provider: string
}

export class TranslationService {
  private cache = new Map<string, TranslationResult>()
  private apiBase = 'http://localhost:4000/api'

  async translate(text: string): Promise<MessageResponse<TranslationResult>> {
    const cacheKey = text.slice(0, 100)

    if (this.cache.has(cacheKey)) {
      return { success: true, data: this.cache.get(cacheKey) }
    }

    try {
      const response = await fetch(`${this.apiBase}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: 'zh' }),
      })

      if (!response.ok) {
        return { success: false, error: 'Translation failed' }
      }

      const data: TranslationResult = await response.json()
      this.cache.set(cacheKey, data)

      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }
}
