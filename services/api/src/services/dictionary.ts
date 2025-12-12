import { redis } from '../lib/redis.js'

// Free Dictionary API 响应类型
interface FreeDictPhonetic {
  text?: string
  audio?: string
}

interface FreeDictDefinition {
  definition: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
}

interface FreeDictMeaning {
  partOfSpeech: string
  definitions: FreeDictDefinition[]
}

interface FreeDictEntry {
  word: string
  phonetic?: string
  phonetics?: FreeDictPhonetic[]
  origin?: string
  meanings: FreeDictMeaning[]
}

export interface DictionaryEntry {
  word: string
  lemma: string
  phonetic?: string
  audioUrl?: string
  definitions: {
    partOfSpeech: string
    meaning: string
    meaningCn?: string
  }[]
  examples?: string[]
  wordForms?: {
    form: string
    type: string
  }[]
}

export class DictionaryService {
  private cachePrefix = 'dict:'
  private cacheTTL = 60 * 60 * 24 * 7 // 7 days

  async lookup(word: string): Promise<DictionaryEntry | null> {
    const cached = await this.getFromCache(word)
    if (cached) return cached

    const entry = await this.queryDictionary(word)

    if (entry) {
      await this.setCache(word, entry)
    }

    return entry
  }

  async batchLookup(words: string[]): Promise<Record<string, DictionaryEntry | null>> {
    const results: Record<string, DictionaryEntry | null> = {}

    const cached = await this.batchGetFromCache(words)
    const uncached: string[] = []

    words.forEach((word) => {
      if (cached[word]) {
        results[word] = cached[word]
      } else {
        uncached.push(word)
      }
    })

    const lookups = await Promise.all(uncached.map((word) => this.queryDictionary(word)))

    uncached.forEach((word, idx) => {
      results[word] = lookups[idx]
      if (lookups[idx]) {
        this.setCache(word, lookups[idx]!)
      }
    })

    return results
  }

  private async queryDictionary(word: string): Promise<DictionaryEntry | null> {
    try {
      const entry = await this.queryFreeDictionaryAPI(word)
      if (entry) return entry
    } catch (error) {
      console.error('Free Dictionary API error:', error)
    }

    // TODO: Fallback to ECDICT or other local dictionary
    return null
  }

  private async queryFreeDictionaryAPI(word: string): Promise<DictionaryEntry | null> {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`API error: ${response.status}`)
    }

    const data = (await response.json()) as FreeDictEntry[]
    if (!data || data.length === 0) return null

    return this.transformFreeDictEntry(data[0])
  }

  private transformFreeDictEntry(entry: FreeDictEntry): DictionaryEntry {
    const definitions: DictionaryEntry['definitions'] = []
    const examples: string[] = []

    for (const meaning of entry.meanings) {
      for (const def of meaning.definitions) {
        definitions.push({
          partOfSpeech: this.normalizePartOfSpeech(meaning.partOfSpeech),
          meaning: def.definition,
        })

        if (def.example) {
          examples.push(def.example)
        }
      }
    }

    // 提取音标：优先使用带音频的
    let phonetic = entry.phonetic
    const audioUrl = entry.phonetics?.find((p) => p.audio)?.audio
    if (!phonetic && entry.phonetics?.length) {
      phonetic = entry.phonetics.find((p) => p.text)?.text
    }

    return {
      word: entry.word,
      lemma: entry.word.toLowerCase(),
      phonetic,
      audioUrl,
      definitions,
      examples: examples.length > 0 ? examples : undefined,
    }
  }

  private normalizePartOfSpeech(pos: string): string {
    const map: Record<string, string> = {
      noun: 'n.',
      verb: 'v.',
      adjective: 'adj.',
      adverb: 'adv.',
      pronoun: 'pron.',
      preposition: 'prep.',
      conjunction: 'conj.',
      interjection: 'interj.',
      exclamation: 'interj.',
    }
    return map[pos.toLowerCase()] || pos
  }

  private async getFromCache(word: string): Promise<DictionaryEntry | null> {
    try {
      const data = await redis.get(`${this.cachePrefix}${word}`)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  private async batchGetFromCache(words: string[]): Promise<Record<string, DictionaryEntry | null>> {
    const results: Record<string, DictionaryEntry | null> = {}

    try {
      const keys = words.map((w) => `${this.cachePrefix}${w}`)
      const values = await redis.mget(...keys)

      words.forEach((word, idx) => {
        const value = values[idx]
        results[word] = value ? JSON.parse(value) : null
      })
    } catch {
      words.forEach((word) => {
        results[word] = null
      })
    }

    return results
  }

  private async setCache(word: string, entry: DictionaryEntry): Promise<void> {
    try {
      await redis.setex(`${this.cachePrefix}${word}`, this.cacheTTL, JSON.stringify(entry))
    } catch {
      // Ignore cache errors
    }
  }
}
