import type { ReadingPosition, Locator } from './types.js'

export function locatorToPosition(locator: Locator): ReadingPosition {
  return {
    cfi: locator.locations.cfi || '',
    percentage: (locator.locations.totalProgression || 0) * 100,
    chapterTitle: locator.title,
  }
}

export function positionToLocator(position: ReadingPosition, href: string = ''): Locator {
  return {
    href,
    type: 'application/xhtml+xml',
    title: position.chapterTitle,
    locations: {
      cfi: position.cfi,
      totalProgression: position.percentage / 100,
    },
  }
}

export function compareCFI(a: string, b: string): number {
  const parseSteps = (cfi: string): number[] => {
    const matches = cfi.match(/\d+/g)
    return matches ? matches.map(Number) : []
  }

  const stepsA = parseSteps(a)
  const stepsB = parseSteps(b)

  const maxLen = Math.max(stepsA.length, stepsB.length)

  for (let i = 0; i < maxLen; i++) {
    const valA = stepsA[i] ?? 0
    const valB = stepsB[i] ?? 0

    if (valA < valB) return -1
    if (valA > valB) return 1
  }

  return 0
}

export function isValidCFI(cfi: string): boolean {
  if (!cfi || typeof cfi !== 'string') return false

  const cfiPattern = /^epubcfi\(.+\)$/
  return cfiPattern.test(cfi)
}

export function extractChapterFromCFI(cfi: string): string | null {
  const match = cfi.match(/epubcfi\(\/\d+\/(\d+)/)
  return match ? match[1] : null
}
