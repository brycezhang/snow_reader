import { sendMessage, MessageType } from '../types/message'

class PopupController {
  private toggleExtension: HTMLElement | null
  private toggleAnnotation: HTMLElement | null
  private sendToWebBtn: HTMLElement | null
  private openAppBtn: HTMLElement | null

  constructor() {
    this.toggleExtension = document.getElementById('toggleExtension')
    this.toggleAnnotation = document.getElementById('toggleAnnotation')
    this.sendToWebBtn = document.getElementById('sendToWeb')
    this.openAppBtn = document.getElementById('openApp')

    this.init()
  }

  private async init() {
    await this.loadSettings()
    this.bindEvents()
    await this.loadStats()
  }

  private async loadSettings() {
    const result = await chrome.storage.local.get(['extensionEnabled', 'annotationEnabled'])

    if (result.extensionEnabled !== false) {
      this.toggleExtension?.classList.add('active')
    }

    if (result.annotationEnabled) {
      this.toggleAnnotation?.classList.add('active')
    }
  }

  private bindEvents() {
    this.toggleExtension?.addEventListener('click', async () => {
      this.toggleExtension?.classList.toggle('active')
      const enabled = this.toggleExtension?.classList.contains('active')

      await chrome.storage.local.set({ extensionEnabled: enabled })

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_EXTENSION', payload: { enabled } })
      }
    })

    this.toggleAnnotation?.addEventListener('click', async () => {
      this.toggleAnnotation?.classList.toggle('active')
      const enabled = this.toggleAnnotation?.classList.contains('active')

      await chrome.storage.local.set({ annotationEnabled: enabled })
    })

    this.sendToWebBtn?.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.url || !tab.title) return

      const response = await sendMessage({
        type: MessageType.SEND_TO_WEB,
        payload: {
          url: tab.url,
          title: tab.title,
        },
      })

      if (response.success) {
        this.showNotification('已发送到 Snow Reader')
      } else {
        this.showNotification('发送失败: ' + response.error)
      }
    })

    this.openAppBtn?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000' })
    })
  }

  private async loadStats() {
    const result = await chrome.storage.local.get(['todayWordCount', 'highlightCount'])

    const wordCountEl = document.getElementById('wordCount')
    const highlightCountEl = document.getElementById('highlightCount')

    if (wordCountEl) {
      wordCountEl.textContent = String(result.todayWordCount || 0)
    }
    if (highlightCountEl) {
      highlightCountEl.textContent = String(result.highlightCount || 0)
    }
  }

  private showNotification(message: string) {
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      right: 16px;
      padding: 12px;
      background: #333;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
      z-index: 1000;
    `
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => notification.remove(), 2000)
  }
}

new PopupController()
