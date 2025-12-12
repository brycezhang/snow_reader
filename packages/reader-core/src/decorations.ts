import type { Decoration, DecorationStyle, Locator } from './types.js'

export const HIGHLIGHT_COLORS = {
  yellow: '#ffeb3b',
  green: '#4caf50',
  blue: '#2196f3',
  pink: '#e91e63',
  purple: '#9c27b0',
  orange: '#ff9800',
} as const

export type HighlightColor = keyof typeof HIGHLIGHT_COLORS

export function createHighlightDecoration(
  id: string,
  locator: Locator,
  color: HighlightColor | string = 'yellow'
): Decoration {
  const colorValue = color in HIGHLIGHT_COLORS 
    ? HIGHLIGHT_COLORS[color as HighlightColor] 
    : color

  return {
    id,
    locator,
    style: {
      type: 'highlight',
      color: colorValue,
      opacity: 0.4,
    },
  }
}

export function createUnderlineDecoration(
  id: string,
  locator: Locator,
  color: string = '#333'
): Decoration {
  return {
    id,
    locator,
    style: {
      type: 'underline',
      color,
    },
  }
}

export function createAnnotationDecoration(
  id: string,
  locator: Locator,
  color: string = '#2196f3'
): Decoration {
  return {
    id,
    locator,
    style: {
      type: 'annotation',
      color,
    },
  }
}

export function decorationStyleToCSS(style: DecorationStyle): string {
  switch (style.type) {
    case 'highlight':
      return `background-color: ${style.color}; opacity: ${style.opacity ?? 0.4};`

    case 'underline':
      return `text-decoration: underline; text-decoration-color: ${style.color};`

    case 'annotation':
      return `border-bottom: 2px dashed ${style.color};`

    default:
      return ''
  }
}

export function mergeOverlappingDecorations(decorations: Decoration[]): Decoration[] {
  // Sort by locator CFI
  const sorted = [...decorations].sort((a, b) => {
    const cfiA = a.locator.locations.cfi || ''
    const cfiB = b.locator.locations.cfi || ''
    return cfiA.localeCompare(cfiB)
  })

  // TODO: Implement actual merge logic for overlapping ranges
  return sorted
}
