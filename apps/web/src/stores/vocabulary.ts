import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VocabItem } from '@/types'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const items = ref<VocabItem[]>([])
  const isLoading = ref(false)

  const fetchVocabulary = async () => {
    isLoading.value = true
    try {
      // TODO: 调用后端 API
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addWord = async (_word: string, _context?: string) => {
    // TODO: 添加生词
  }

  const updateMastery = async (_id: string, _level: number) => {
    // TODO: 更新掌握程度
  }

  const removeWord = async (_id: string) => {
    // TODO: 移除生词
  }

  return {
    items,
    isLoading,
    fetchVocabulary,
    addWord,
    updateMastery,
    removeWord,
  }
})
