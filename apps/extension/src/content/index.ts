import { Tokenizer } from './tokenizer'
import { AnnotationRenderer } from './annotation-renderer'
import { SelectionHandler } from './selection-handler'
import { HighlightManager } from './highlight-manager'
import { sendMessage, MessageType } from '../types/message'

class SnowReaderContent {
  private tokenizer: Tokenizer
  private annotationRenderer: AnnotationRenderer
  private selectionHandler: SelectionHandler
  private highlightManager: HighlightManager
  private isEnabled = true

  constructor() {
    this.tokenizer = new Tokenizer()
    this.annotationRenderer = new AnnotationRenderer()
    this.selectionHandler = new SelectionHandler(this.onWordSelected.bind(this))
    this.highlightManager = new HighlightManager()

    this.init()
  }

  private async init() {
    const settings = await sendMessage({
      type: MessageType.GET_USER_SETTINGS,
      payload: {},
    })

    if (settings.success && settings.data) {
      this.isEnabled = settings.data.extensionEnabled ?? true
    }

    if (this.isEnabled) {
      this.setupObserver()
      this.processVisibleContent()
    }

    this.listenForMessages()
  }

  private setupObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.processElement(entry.target as HTMLElement)
          }
        })
      },
      { rootMargin: '100px' }
    )

    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th').forEach((el) => {
      observer.observe(el)
    })
  }

  private processVisibleContent() {
    const viewportHeight = window.innerHeight
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < viewportHeight && rect.bottom > 0) {
        this.processElement(el as HTMLElement)
      }
    })
  }

  private processElement(element: HTMLElement) {
    if (element.dataset.snowProcessed) return
    element.dataset.snowProcessed = 'true'

    const tokens = this.tokenizer.tokenize(element)
    this.annotationRenderer.render(element, tokens)
  }

  private async onWordSelected(word: string, context: string, range: Range) {
    const response = await sendMessage({
      type: MessageType.LOOKUP_WORD,
      payload: { word },
    })

    if (response.success && response.data) {
      this.showDictionaryPopup(response.data, range, context)
    }
  }

  private showDictionaryPopup(entry: unknown, range: Range, _context: string) {
    const popup = document.createElement('snow-reader-popup')
    popup.setAttribute('data-entry', JSON.stringify(entry))

    const rect = range.getBoundingClientRect()
    popup.style.position = 'fixed'
    popup.style.left = `${rect.left}px`
    popup.style.top = `${rect.bottom + 8}px`
    popup.style.zIndex = '999999'

    document.body.appendChild(popup)
  }

  private listenForMessages() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'TOGGLE_EXTENSION') {
        this.isEnabled = message.payload.enabled
        if (this.isEnabled) {
          this.processVisibleContent()
        }
      }
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SnowReaderContent())
} else {
  new SnowReaderContent()
}
