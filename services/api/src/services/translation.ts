import { redis } from '../lib/redis.js'
import { createHash } from 'crypto'

export interface TranslationResult {
  source: string
  translation: string
  provider: string
}

export class TranslationService {
  private cachePrefix = 'trans:'
  private cacheTTL = 60 * 60 * 24 * 30 // 30 days
  private libreTranslateUrl = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000'

  async translate(
    text: string,
    targetLang: string = 'zh',
    sourceLang?: string
  ): Promise<TranslationResult> {
    const cacheKey = this.getCacheKey(text, targetLang, sourceLang)

    const cached = await this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.callTranslationProvider(text, targetLang, sourceLang)

    await this.setCache(cacheKey, result)

    return result
  }

  private async callTranslationProvider(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResult> {
    try {
      const response = await fetch(`${this.libreTranslateUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang || 'en',
          target: targetLang,
        }),
      })

      if (!response.ok) {
        throw new Error('Translation API error')
      }

      const data = (await response.json()) as { translatedText: string }

      return {
        source: text,
        translation: data.translatedText,
        provider: 'libretranslate',
      }
    } catch (error) {
      console.error('Translation error:', error)
      // Fallback: return original text
      return {
        source: text,
        translation: text,
        provider: 'fallback',
      }
    }
  }

  private getCacheKey(text: string, targetLang: string, sourceLang?: string): string {
    const hash = createHash('md5').update(text).digest('hex').slice(0, 16)
    return `${targetLang}:${sourceLang || 'auto'}:${hash}`
  }

  private async getFromCache(key: string): Promise<TranslationResult | null> {
    try {
      const data = await redis.get(`${this.cachePrefix}${key}`)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  private async setCache(key: string, result: TranslationResult): Promise<void> {
    try {
      await redis.setex(`${this.cachePrefix}${key}`, this.cacheTTL, JSON.stringify(result))
    } catch {
      // Ignore cache errors
    }
  }
}
