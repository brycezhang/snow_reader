export enum MessageType {
  LOOKUP_WORD = 'LOOKUP_WORD',
  TRANSLATE_TEXT = 'TRANSLATE_TEXT',
  SAVE_HIGHLIGHT = 'SAVE_HIGHLIGHT',
  SAVE_NOTE = 'SAVE_NOTE',
  ADD_VOCABULARY = 'ADD_VOCABULARY',
  SEND_TO_WEB = 'SEND_TO_WEB',
  GET_USER_SETTINGS = 'GET_USER_SETTINGS',
}

export interface Message {
  type: MessageType
  payload: Record<string, unknown>
}

export interface MessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export function sendMessage<T = unknown>(message: Message): Promise<MessageResponse<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: MessageResponse<T>) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: chrome.runtime.lastError.message })
      } else {
        resolve(response)
      }
    })
  })
}
