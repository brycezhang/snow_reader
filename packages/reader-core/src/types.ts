export interface ReaderPreferences {
  fontSize: number
  lineHeight: number
  margin: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
  pageMode: 'paginated' | 'scrolled'
  columnCount: 1 | 2 | 'auto'
}

export interface ReadingPosition {
  cfi: string
  percentage: number
  chapterIndex?: number
  chapterTitle?: string
}

export interface Locator {
  href: string
  type: string
  title?: string
  locations: {
    cfi?: string
    progression?: number
    position?: number
    totalProgression?: number
  }
  text?: {
    before?: string
    highlight?: string
    after?: string
  }
}

export interface Decoration {
  id: string
  locator: Locator
  style: DecorationStyle
}

export interface DecorationStyle {
  type: 'highlight' | 'underline' | 'annotation'
  color?: string
  opacity?: number
}

export interface Selection {
  locator: Locator
  text: string
  rect: DOMRect
}

export interface NavigatorEvent {
  type: NavigatorEventType
  payload: unknown
}

export type NavigatorEventType =
  | 'locatorChanged'
  | 'selectionChanged'
  | 'decorationActivated'
  | 'tapOnLink'
  | 'error'

export interface Publication {
  metadata: PublicationMetadata
  readingOrder: Link[]
  tableOfContents: Link[]
  resources: Link[]
}

export interface PublicationMetadata {
  identifier?: string
  title: string
  author?: string | string[]
  language?: string | string[]
  publisher?: string
  published?: string
  modified?: string
  description?: string
  cover?: string
}

export interface Link {
  href: string
  type?: string
  title?: string
  children?: Link[]
}
