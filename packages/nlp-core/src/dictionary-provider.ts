import type { DictionaryEntry, DictionaryProvider } from './types.js'

export class OnlineDictionaryProvider implements DictionaryProvider {
  name = 'online'
  private apiBase: string
  private cache = new Map<string, DictionaryEntry | null>()

  constructor(apiBase: string) {
    this.apiBase = apiBase
  }

  async lookup(word: string): Promise<DictionaryEntry | null> {
    const lemma = word.toLowerCase().trim()

    if (this.cache.has(lemma)) {
      return this.cache.get(lemma) || null
    }

    try {
      const response = await fetch(`${this.apiBase}/dictionary/${encodeURIComponent(lemma)}`)

      if (!response.ok) {
        this.cache.set(lemma, null)
        return null
      }

      const data = await response.json()
      const entry = data.data as DictionaryEntry

      this.cache.set(lemma, entry)
      return entry
    } catch {
      return null
    }
  }

  async batchLookup(words: string[]): Promise<Map<string, DictionaryEntry | null>> {
    const results = new Map<string, DictionaryEntry | null>()
    const uncached: string[] = []

    for (const word of words) {
      const lemma = word.toLowerCase().trim()
      if (this.cache.has(lemma)) {
        results.set(lemma, this.cache.get(lemma) || null)
      } else {
        uncached.push(lemma)
      }
    }

    if (uncached.length > 0) {
      try {
        const response = await fetch(`${this.apiBase}/dictionary/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words: uncached }),
        })

        if (response.ok) {
          const data = await response.json()
          const entries = data.data as Record<string, DictionaryEntry | null>

          for (const [word, entry] of Object.entries(entries)) {
            this.cache.set(word, entry)
            results.set(word, entry)
          }
        }
      } catch {
        for (const word of uncached) {
          results.set(word, null)
        }
      }
    }

    return results
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export class OfflineDictionaryProvider implements DictionaryProvider {
  name = 'offline'
  isOffline = true
  private db: IDBDatabase | null = null
  private dbName = 'snow-reader-dictionary'

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('entries')) {
          const store = db.createObjectStore('entries', { keyPath: 'lemma' })
          store.createIndex('word', 'word', { unique: false })
        }
      }
    })
  }

  async lookup(word: string): Promise<DictionaryEntry | null> {
    if (!this.db) {
      await this.initialize()
    }

    const lemma = word.toLowerCase().trim()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entries'], 'readonly')
      const store = transaction.objectStore('entries')
      const request = store.get(lemma)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async importDictionary(entries: DictionaryEntry[]): Promise<void> {
    if (!this.db) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entries'], 'readwrite')
      const store = transaction.objectStore('entries')

      for (const entry of entries) {
        store.put(entry)
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entries'], 'readwrite')
      const store = transaction.objectStore('entries')
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

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

interface FreeDictApiEntry {
  word: string
  phonetic?: string
  phonetics?: FreeDictPhonetic[]
  origin?: string
  meanings: FreeDictMeaning[]
}

export class FreeDictionaryProvider implements DictionaryProvider {
  name = 'free-dictionary'
  private cache = new Map<string, DictionaryEntry | null>()
  private apiBase = 'https://api.dictionaryapi.dev/api/v2/entries/en'

  async lookup(word: string): Promise<DictionaryEntry | null> {
    const lemma = word.toLowerCase().trim()

    if (this.cache.has(lemma)) {
      return this.cache.get(lemma) || null
    }

    try {
      const response = await fetch(`${this.apiBase}/${encodeURIComponent(lemma)}`)

      if (!response.ok) {
        if (response.status === 404) {
          this.cache.set(lemma, null)
          return null
        }
        throw new Error(`API error: ${response.status}`)
      }

      const data = (await response.json()) as FreeDictApiEntry[]
      if (!data || data.length === 0) {
        this.cache.set(lemma, null)
        return null
      }

      const entry = this.transformEntry(data[0])
      this.cache.set(lemma, entry)
      return entry
    } catch {
      return null
    }
  }

  async batchLookup(words: string[]): Promise<Map<string, DictionaryEntry | null>> {
    const results = new Map<string, DictionaryEntry | null>()

    // Free Dictionary API 不支持批量查询，逐个查询
    await Promise.all(
      words.map(async (word) => {
        const entry = await this.lookup(word)
        results.set(word.toLowerCase().trim(), entry)
      })
    )

    return results
  }

  private transformEntry(apiEntry: FreeDictApiEntry): DictionaryEntry {
    const definitions: DictionaryEntry['definitions'] = []
    const examples: string[] = []
    const synonyms: string[] = []
    const antonyms: string[] = []

    for (const meaning of apiEntry.meanings) {
      for (const def of meaning.definitions) {
        definitions.push({
          partOfSpeech: this.normalizePartOfSpeech(meaning.partOfSpeech),
          meaning: def.definition,
          examples: def.example ? [def.example] : undefined,
        })

        if (def.example) {
          examples.push(def.example)
        }
        if (def.synonyms?.length) {
          synonyms.push(...def.synonyms)
        }
        if (def.antonyms?.length) {
          antonyms.push(...def.antonyms)
        }
      }
    }

    // 提取音标和音频
    let phonetic = apiEntry.phonetic
    let audioUrl: string | undefined

    if (apiEntry.phonetics?.length) {
      const withAudio = apiEntry.phonetics.find((p) => p.audio && p.audio.length > 0)
      if (withAudio) {
        audioUrl = withAudio.audio
        if (!phonetic && withAudio.text) {
          phonetic = withAudio.text
        }
      }
      if (!phonetic) {
        phonetic = apiEntry.phonetics.find((p) => p.text)?.text
      }
    }

    return {
      word: apiEntry.word,
      lemma: apiEntry.word.toLowerCase(),
      phonetic,
      audioUrl,
      definitions,
      examples: examples.length > 0 ? examples : undefined,
      synonyms: [...new Set(synonyms)],
      antonyms: [...new Set(antonyms)],
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

  clearCache(): void {
    this.cache.clear()
  }
}

export function createDictionaryProvider(
  type: 'online' | 'offline' | 'free-dictionary',
  options?: { apiBase?: string }
): DictionaryProvider {
  if (type === 'offline') {
    return new OfflineDictionaryProvider()
  }

  if (type === 'free-dictionary') {
    return new FreeDictionaryProvider()
  }

  return new OnlineDictionaryProvider(options?.apiBase || '/api')
}
