import type {
  ReaderPreferences,
  ReadingPosition,
  Decoration,
  NavigatorEvent,
  NavigatorEventType,
  Selection,
} from './types.js'

export type NavigatorEventHandler = (event: NavigatorEvent) => void

export interface NavigatorBridgeOptions {
  iframe: HTMLIFrameElement
  publicationUrl: string
  onEvent?: NavigatorEventHandler
}

export class NavigatorBridge {
  private iframe: HTMLIFrameElement
  private publicationUrl: string
  private eventHandler?: NavigatorEventHandler
  private messageHandler: (event: MessageEvent) => void

  constructor(options: NavigatorBridgeOptions) {
    this.iframe = options.iframe
    this.publicationUrl = options.publicationUrl
    this.eventHandler = options.onEvent

    this.messageHandler = this.handleMessage.bind(this)
    window.addEventListener('message', this.messageHandler)
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Navigator initialization timeout'))
      }, 10000)

      const handleReady = (event: MessageEvent) => {
        if (event.data?.type === 'navigatorReady') {
          clearTimeout(timeout)
          window.removeEventListener('message', handleReady)
          resolve()
        }
      }

      window.addEventListener('message', handleReady)

      this.iframe.src = this.publicationUrl
    })
  }

  destroy(): void {
    window.removeEventListener('message', this.messageHandler)
  }

  goToLocator(cfi: string): void {
    this.postMessage('goToLocator', { cfi })
  }

  goToChapter(href: string): void {
    this.postMessage('goToChapter', { href })
  }

  nextPage(): void {
    this.postMessage('nextPage')
  }

  previousPage(): void {
    this.postMessage('previousPage')
  }

  setPreferences(preferences: Partial<ReaderPreferences>): void {
    this.postMessage('setPreferences', preferences)
  }

  addDecoration(decoration: Decoration): void {
    this.postMessage('addDecoration', decoration)
  }

  removeDecoration(id: string): void {
    this.postMessage('removeDecoration', { id })
  }

  clearDecorations(): void {
    this.postMessage('clearDecorations')
  }

  getCurrentPosition(): Promise<ReadingPosition> {
    return this.sendRequest('getCurrentPosition')
  }

  getSelection(): Promise<Selection | null> {
    return this.sendRequest('getSelection')
  }

  private postMessage(type: string, payload?: unknown): void {
    this.iframe.contentWindow?.postMessage({ type, payload }, '*')
  }

  private sendRequest<T>(type: string, payload?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).slice(2)
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler)
        reject(new Error(`Request timeout: ${type}`))
      }, 5000)

      const handler = (event: MessageEvent) => {
        if (event.data?.requestId === requestId) {
          clearTimeout(timeout)
          window.removeEventListener('message', handler)

          if (event.data.error) {
            reject(new Error(event.data.error))
          } else {
            resolve(event.data.result)
          }
        }
      }

      window.addEventListener('message', handler)
      this.postMessage(type, { ...payload, requestId })
    })
  }

  private handleMessage(event: MessageEvent): void {
    const { type, payload } = event.data || {}

    if (!type || !this.isNavigatorEvent(type)) return

    this.eventHandler?.({
      type: type as NavigatorEventType,
      payload,
    })
  }

  private isNavigatorEvent(type: string): boolean {
    const eventTypes: NavigatorEventType[] = [
      'locatorChanged',
      'selectionChanged',
      'decorationActivated',
      'tapOnLink',
      'error',
    ]
    return eventTypes.includes(type as NavigatorEventType)
  }
}
