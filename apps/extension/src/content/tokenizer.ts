export interface Token {
  text: string
  lemma: string
  isWord: boolean
  startOffset: number
  endOffset: number
}

export class Tokenizer {
  private wordPattern = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g

  tokenize(element: HTMLElement): Token[] {
    const tokens: Token[] = []
    const textContent = element.textContent || ''

    let match: RegExpExecArray | null
    let lastIndex = 0

    while ((match = this.wordPattern.exec(textContent)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          text: textContent.slice(lastIndex, match.index),
          lemma: '',
          isWord: false,
          startOffset: lastIndex,
          endOffset: match.index,
        })
      }

      const word = match[0]
      tokens.push({
        text: word,
        lemma: this.getLemma(word),
        isWord: true,
        startOffset: match.index,
        endOffset: match.index + word.length,
      })

      lastIndex = match.index + word.length
    }

    if (lastIndex < textContent.length) {
      tokens.push({
        text: textContent.slice(lastIndex),
        lemma: '',
        isWord: false,
        startOffset: lastIndex,
        endOffset: textContent.length,
      })
    }

    return tokens
  }

  private getLemma(word: string): string {
    const lower = word.toLowerCase()

    const irregulars: Record<string, string> = {
      was: 'be',
      were: 'be',
      been: 'be',
      am: 'be',
      is: 'be',
      are: 'be',
      had: 'have',
      has: 'have',
      did: 'do',
      does: 'do',
      went: 'go',
      gone: 'go',
    }

    if (irregulars[lower]) {
      return irregulars[lower]
    }

    if (lower.endsWith('ies') && lower.length > 4) {
      return lower.slice(0, -3) + 'y'
    }
    if (lower.endsWith('es') && lower.length > 3) {
      return lower.slice(0, -2)
    }
    if (lower.endsWith('s') && lower.length > 2) {
      return lower.slice(0, -1)
    }
    if (lower.endsWith('ed') && lower.length > 3) {
      return lower.slice(0, -2)
    }
    if (lower.endsWith('ing') && lower.length > 4) {
      return lower.slice(0, -3)
    }

    return lower
  }
}
