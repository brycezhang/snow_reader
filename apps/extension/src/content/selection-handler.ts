type SelectionCallback = (word: string, context: string, range: Range) => void

export class SelectionHandler {
  private callback: SelectionCallback
  private debounceTimer: number | null = null

  constructor(callback: SelectionCallback) {
    this.callback = callback
    this.init()
  }

  private init() {
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    document.addEventListener('snow-word-click', this.handleWordClick.bind(this) as EventListener)
  }

  private handleMouseUp() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) return

      const text = selection.toString().trim()
      if (!text || text.length > 100) return

      const range = selection.getRangeAt(0)
      const context = this.getContext(range)

      this.callback(text, context, range)
    }, 200)
  }

  private handleWordClick(event: CustomEvent<{ word: string; lemma: string }>) {
    const { word } = event.detail
    const target = event.target as HTMLElement

    const range = document.createRange()
    range.selectNode(target)

    const context = this.getContext(range)
    this.callback(word, context, range)
  }

  private getContext(range: Range): string {
    const container = range.commonAncestorContainer
    const paragraph =
      container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as HTMLElement)

    const block = paragraph?.closest('p, li, h1, h2, h3, h4, h5, h6, td, th, div')
    return block?.textContent?.trim().slice(0, 500) || ''
  }
}
