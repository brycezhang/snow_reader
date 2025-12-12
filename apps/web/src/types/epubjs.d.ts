declare module 'epubjs' {
  export interface Book {
    ready: Promise<void>
    loaded: {
      metadata: Promise<Metadata>
      navigation: Promise<Navigation>
      spine: Promise<Spine>
    }
    spine: Spine
    renderTo(element: HTMLElement, options?: RenditionOptions): Rendition
    destroy(): void
  }

  export interface Metadata {
    title: string
    creator: string
    description?: string
    pubdate?: string
    publisher?: string
    identifier?: string
    language?: string
    rights?: string
    modified_date?: string
    layout?: string
    orientation?: string
    flow?: string
    viewport?: string
    spread?: string
  }

  export interface Navigation {
    toc: NavItem[]
    landmarks?: NavItem[]
  }

  export interface NavItem {
    id: string
    href: string
    label: string
    subitems?: NavItem[]
    parent?: string
  }

  export interface Spine {
    length: number
    items: SpineItem[]
    get(index: number): SpineItem | undefined
  }

  export interface SpineItem {
    index: number
    href: string
    url: string
    canonical: string
    cfiBase: string
  }

  export interface RenditionOptions {
    width?: string | number
    height?: string | number
    spread?: 'auto' | 'none' | 'always'
    flow?: 'paginated' | 'scrolled' | 'scrolled-doc'
    minSpreadWidth?: number
    resizeOnOrientationChange?: boolean
    script?: string
    stylesheet?: string
  }

  export interface Rendition {
    display(target?: string): Promise<void>
    next(): Promise<void>
    prev(): Promise<void>
    destroy(): void
    on(event: string, callback: (...args: any[]) => void): void
    off(event: string, callback: (...args: any[]) => void): void
    themes: Themes
    getContents(): Contents[]
    currentLocation(): Location | null
  }

  export interface Themes {
    default(styles: Record<string, Record<string, string>>): void
    register(name: string, styles: Record<string, Record<string, string>>): void
    select(name: string): void
    fontSize(size: string): void
  }

  export interface Contents {
    document: Document
    window: Window
  }

  export interface Location {
    start: {
      cfi: string
      displayed: {
        page: number
        total: number
      }
      href: string
      index: number
      percentage: number
    }
    end: {
      cfi: string
      displayed: {
        page: number
        total: number
      }
      href: string
      index: number
      percentage: number
    }
    atStart: boolean
    atEnd: boolean
  }

  export default function ePub(source: string | ArrayBuffer, options?: object): Book
}
