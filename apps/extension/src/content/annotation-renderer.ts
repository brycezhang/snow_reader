import type { Token } from './tokenizer'

export class AnnotationRenderer {
  render(element: HTMLElement, tokens: Token[]) {
    if (!tokens.some((t) => t.isWord)) return

    const fragment = document.createDocumentFragment()

    tokens.forEach((token) => {
      if (token.isWord) {
        const span = document.createElement('span')
        span.className = 'snow-token'
        span.textContent = token.text
        span.dataset.lemma = token.lemma
        span.addEventListener('click', this.handleTokenClick.bind(this))
        fragment.appendChild(span)
      } else {
        fragment.appendChild(document.createTextNode(token.text))
      }
    })

    element.textContent = ''
    element.appendChild(fragment)
  }

  private handleTokenClick(event: Event) {
    const target = event.target as HTMLElement
    const word = target.textContent || ''
    const lemma = target.dataset.lemma || word

    const customEvent = new CustomEvent('snow-word-click', {
      bubbles: true,
      detail: { word, lemma },
    })
    target.dispatchEvent(customEvent)
  }
}
