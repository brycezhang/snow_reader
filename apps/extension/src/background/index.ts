import { MessageType, type Message, type MessageResponse } from '../types/message'
import { DictionaryService } from '../services/dictionary'
import { TranslationService } from '../services/translation'
import { ApiService } from '../services/api'

const dictionaryService = new DictionaryService()
const translationService = new TranslationService()
const apiService = new ApiService()

chrome.runtime.onInstalled.addListener(() => {
  console.log('Snow Reader extension installed')
})

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }
)

async function handleMessage(message: Message): Promise<MessageResponse> {
  switch (message.type) {
    case MessageType.LOOKUP_WORD:
      return await dictionaryService.lookup(message.payload.word)

    case MessageType.TRANSLATE_TEXT:
      return await translationService.translate(message.payload.text)

    case MessageType.SAVE_HIGHLIGHT:
      return await apiService.saveHighlight(message.payload)

    case MessageType.SAVE_NOTE:
      return await apiService.saveNote(message.payload)

    case MessageType.ADD_VOCABULARY:
      return await apiService.addVocabulary(message.payload)

    case MessageType.SEND_TO_WEB:
      return await apiService.sendArticle(message.payload)

    case MessageType.GET_USER_SETTINGS:
      return await apiService.getUserSettings()

    default:
      return { success: false, error: 'Unknown message type' }
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})
