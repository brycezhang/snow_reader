import type { MessageResponse } from '../types/message'

export class ApiService {
  private apiBase = 'http://localhost:4000/api'
  private token: string | null = null

  async init() {
    const result = await chrome.storage.local.get('authToken')
    this.token = result.authToken || null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MessageResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      }

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.apiBase}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        return { success: false, error: error.message }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async saveHighlight(payload: Record<string, unknown>): Promise<MessageResponse> {
    return this.request('/highlights', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async saveNote(payload: Record<string, unknown>): Promise<MessageResponse> {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async addVocabulary(payload: Record<string, unknown>): Promise<MessageResponse> {
    return this.request('/vocabulary', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendArticle(payload: Record<string, unknown>): Promise<MessageResponse> {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getUserSettings(): Promise<MessageResponse> {
    return this.request('/user/settings')
  }
}
