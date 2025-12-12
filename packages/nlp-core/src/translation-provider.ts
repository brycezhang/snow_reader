import type { TranslationResult, TranslationProvider } from './types.js'

export class OnlineTranslationProvider implements TranslationProvider {
  name = 'online'
  private apiBase: string
  private cache = new Map<string, TranslationResult>()

  constructor(apiBase: string) {
    this.apiBase = apiBase
  }

  async translate(
    text: string,
    targetLang: string = 'zh',
    sourceLang?: string
  ): Promise<TranslationResult> {
    const cacheKey = `${sourceLang || 'auto'}:${targetLang}:${text.slice(0, 256)}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const response = await fetch(`${this.apiBase}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      const result = data.data as TranslationResult

      this.cache.set(cacheKey, result)
      return result
    } catch {
      return {
        source: text,
        translation: text,
        provider: 'fallback',
      }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export class MockTranslationProvider implements TranslationProvider {
  name = 'mock'
  isOffline = true

  async translate(
    text: string,
    targetLang: string = 'zh',
    _sourceLang?: string
  ): Promise<TranslationResult> {
    // For offline/testing, just return the original text
    return {
      source: text,
      translation: `[${targetLang}] ${text}`,
      provider: 'mock',
    }
  }
}

export interface OllamaOptions {
  baseUrl?: string
  model?: string
}

export class OllamaTranslationProvider implements TranslationProvider {
  name = 'ollama'
  isOffline = true
  private baseUrl: string
  private model: string
  private cache = new Map<string, TranslationResult>()

  constructor(options?: OllamaOptions) {
    this.baseUrl = options?.baseUrl || 'http://localhost:11434'
    this.model = options?.model || 'qwen3:4b-instruct'
  }

  async translate(
    text: string,
    targetLang: string = 'zh',
    sourceLang?: string
  ): Promise<TranslationResult> {
    const cacheKey = `${sourceLang || 'en'}:${targetLang}:${text.slice(0, 256)}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const langName = targetLang === 'zh' ? '中文' : targetLang
      const prompt = `Translate the following English text to ${langName}. Only output the translation, nothing else.\n\nText: ${text}`

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 512,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = (await response.json()) as { response: string }
      const translation = data.response.trim()

      const result: TranslationResult = {
        source: text,
        translation,
        provider: 'ollama',
      }

      this.cache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('Ollama translation error:', error)
      return {
        source: text,
        translation: text,
        provider: 'fallback',
      }
    }
  }

  async lookupWord(word: string, context?: string): Promise<string> {
    const prompt = context
      ? `解释英文单词 "${word}" 在以下语境中的含义，用简洁的中文回答：\n\n语境：${context}\n\n只输出释义，不要其他内容。`
      : `用简洁的中文解释英文单词 "${word}" 的常见含义。只输出释义，不要其他内容。`

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 256,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = (await response.json()) as { response: string }
      return data.response.trim()
    } catch (error) {
      console.error('Ollama lookup error:', error)
      return ''
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export function createTranslationProvider(
  type: 'online' | 'mock' | 'ollama',
  options?: { apiBase?: string; ollamaModel?: string }
): TranslationProvider {
  if (type === 'mock') {
    return new MockTranslationProvider()
  }

  if (type === 'ollama') {
    return new OllamaTranslationProvider({
      baseUrl: options?.apiBase,
      model: options?.ollamaModel,
    })
  }

  return new OnlineTranslationProvider(options?.apiBase || '/api')
}
