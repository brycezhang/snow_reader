import type { Token } from './types.js'
import { getLemma } from './lemmatizer.js'

const WORD_PATTERN = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g

export function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let match: RegExpExecArray | null
  let lastIndex = 0

  WORD_PATTERN.lastIndex = 0

  while ((match = WORD_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        text: text.slice(lastIndex, match.index),
        lemma: '',
        isWord: false,
        startOffset: lastIndex,
        endOffset: match.index,
      })
    }

    const word = match[0]
    tokens.push({
      text: word,
      lemma: getLemma(word),
      isWord: true,
      startOffset: match.index,
      endOffset: match.index + word.length,
    })

    lastIndex = match.index + word.length
  }

  if (lastIndex < text.length) {
    tokens.push({
      text: text.slice(lastIndex),
      lemma: '',
      isWord: false,
      startOffset: lastIndex,
      endOffset: text.length,
    })
  }

  return tokens
}

export function tokenizeToWords(text: string): string[] {
  const matches = text.match(WORD_PATTERN)
  return matches || []
}

export function getUniqueWords(text: string): string[] {
  const words = tokenizeToWords(text)
  const lemmas = words.map((w) => getLemma(w))
  return [...new Set(lemmas)]
}

export function countWords(text: string): number {
  return tokenizeToWords(text).length
}

export function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function getContext(text: string, offset: number, windowSize: number = 50): string {
  const start = Math.max(0, offset - windowSize)
  const end = Math.min(text.length, offset + windowSize)

  let context = text.slice(start, end)

  if (start > 0) context = '...' + context
  if (end < text.length) context = context + '...'

  return context.trim()
}
