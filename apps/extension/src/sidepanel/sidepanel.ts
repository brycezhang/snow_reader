class SidePanelController {
  private tabs: NodeListOf<HTMLElement>
  private panels: NodeListOf<HTMLElement>

  constructor() {
    this.tabs = document.querySelectorAll('.tab')
    this.panels = document.querySelectorAll('.panel')

    this.init()
  }

  private init() {
    this.bindEvents()
    this.listenForMessages()
  }

  private bindEvents() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab
        if (!tabName) return

        this.tabs.forEach((t) => t.classList.remove('active'))
        tab.classList.add('active')

        this.panels.forEach((p) => {
          p.style.display = p.id === `${tabName}-panel` ? 'block' : 'none'
        })
      })
    })
  }

  private listenForMessages() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SHOW_DICTIONARY') {
        this.showDictionary(message.payload)
      }
    })
  }

  private showDictionary(entry: {
    word: string
    phonetic?: string
    definitions: { partOfSpeech: string; meaning: string; meaningCn?: string }[]
  }) {
    const container = document.getElementById('dictionary-content')
    if (!container) return

    if (!entry) {
      container.innerHTML = '<div class="empty-state">未找到释义</div>'
      return
    }

    const definitionsHtml = entry.definitions
      .map(
        (def) => `
        <div class="word-definition">
          <span class="word-pos">${def.partOfSpeech}</span>
          ${def.meaning}
          ${def.meaningCn ? `<span style="color: #666; margin-left: 8px;">${def.meaningCn}</span>` : ''}
        </div>
      `
      )
      .join('')

    container.innerHTML = `
      <div class="word-entry">
        <span class="word-title">${entry.word}</span>
        ${entry.phonetic ? `<span class="word-phonetic">${entry.phonetic}</span>` : ''}
        ${definitionsHtml}
      </div>
    `
  }
}

new SidePanelController()
