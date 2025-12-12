export interface HighlightAnchor {
  xpath: string
  startOffset: number
  endOffset: number
  text: string
}

export class HighlightManager {
  private highlights: Map<string, HTMLElement[]> = new Map()

  createHighlight(range: Range, color: string, id: string): HighlightAnchor | null {
    try {
      const anchor = this.createAnchor(range)

      const spans = this.wrapRange(range, color, id)
      this.highlights.set(id, spans)

      return anchor
    } catch (error) {
      console.error('Failed to create highlight:', error)
      return null
    }
  }

  removeHighlight(id: string) {
    const spans = this.highlights.get(id)
    if (!spans) return

    spans.forEach((span) => {
      const parent = span.parentNode
      if (parent) {
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span)
        }
        parent.removeChild(span)
      }
    })

    this.highlights.delete(id)
  }

  private createAnchor(range: Range): HighlightAnchor {
    const startContainer = range.startContainer
    const xpath = this.getXPath(
      startContainer.nodeType === Node.TEXT_NODE
        ? (startContainer.parentElement as Element)
        : (startContainer as Element)
    )

    return {
      xpath,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      text: range.toString(),
    }
  }

  private getXPath(element: Element): string {
    const parts: string[] = []
    let current: Element | null = element

    while (current && current !== document.body) {
      let index = 1
      let sibling = current.previousElementSibling

      while (sibling) {
        if (sibling.tagName === current.tagName) {
          index++
        }
        sibling = sibling.previousElementSibling
      }

      const tagName = current.tagName.toLowerCase()
      parts.unshift(`${tagName}[${index}]`)
      current = current.parentElement
    }

    return '//' + parts.join('/')
  }

  private wrapRange(range: Range, color: string, id: string): HTMLElement[] {
    const spans: HTMLElement[] = []

    const span = document.createElement('span')
    span.className = 'snow-highlight'
    span.style.backgroundColor = color
    span.dataset.highlightId = id

    try {
      range.surroundContents(span)
      spans.push(span)
    } catch {
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
      spans.push(span)
    }

    return spans
  }

  restoreHighlight(anchor: HighlightAnchor, color: string, id: string) {
    try {
      const result = document.evaluate(
        anchor.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      )

      const element = result.singleNodeValue as Element
      if (!element) return

      const textNode = this.findTextNode(element, anchor.text)
      if (!textNode) return

      const range = document.createRange()
      range.setStart(textNode, anchor.startOffset)
      range.setEnd(textNode, anchor.endOffset)

      this.wrapRange(range, color, id)
    } catch (error) {
      console.error('Failed to restore highlight:', error)
    }
  }

  private findTextNode(element: Element, text: string): Text | null {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)

    let node: Text | null
    while ((node = walker.nextNode() as Text)) {
      if (node.textContent?.includes(text)) {
        return node
      }
    }

    return null
  }
}
