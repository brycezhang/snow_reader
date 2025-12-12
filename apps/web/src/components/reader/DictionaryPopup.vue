<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { DictionaryEntry } from '@/types'
import { useOllama } from '@/composables/useOllama'

const props = defineProps<{
  word: string
  context?: string
  position: { x: number; y: number }
}>()

// 计算安全的弹窗位置，避免超出屏幕
const safePosition = computed(() => {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - 340 : 500
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 300 : 400
  return {
    x: Math.max(10, Math.min(props.position.x, maxX)),
    y: Math.max(10, Math.min(props.position.y, maxY)),
  }
})

const emit = defineEmits<{
  close: []
}>()

const { translate, lookupWord: ollamaLookup, isLoading: ollamaLoading } = useOllama()

const entry = ref<DictionaryEntry | null>(null)
const aiMeaning = ref('')
const translation = ref('')
const isLoading = ref(false)
const isTranslating = ref(false)
const audioElement = ref<HTMLAudioElement | null>(null)

const lookupWord = async (word: string) => {
  isLoading.value = true
  aiMeaning.value = ''
  translation.value = ''

  try {
    // 1. 先查 Free Dictionary API
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    )

    if (response.ok) {
      const data = await response.json()
      if (data?.length) {
        entry.value = transformEntry(data[0])
      } else {
        entry.value = null
      }
    } else {
      entry.value = null
    }

    // 2. 同时用 Ollama 获取中文释义
    ollamaLookup(word, props.context).then((meaning) => {
      aiMeaning.value = meaning
    })
  } catch (error) {
    console.error('Dictionary lookup error:', error)
    entry.value = null
  } finally {
    isLoading.value = false
  }
}

const transformEntry = (apiEntry: any): DictionaryEntry => {
  const definitions: DictionaryEntry['definitions'] = []
  const examples: string[] = []

  for (const meaning of apiEntry.meanings || []) {
    for (const def of meaning.definitions || []) {
      definitions.push({
        partOfSpeech: meaning.partOfSpeech,
        meaning: def.definition,
      })
      if (def.example) {
        examples.push(def.example)
      }
    }
  }

  let phonetic = apiEntry.phonetic
  let audioUrl: string | undefined

  if (apiEntry.phonetics?.length) {
    const withAudio = apiEntry.phonetics.find((p: any) => p.audio?.length > 0)
    if (withAudio) {
      audioUrl = withAudio.audio
      if (!phonetic && withAudio.text) {
        phonetic = withAudio.text
      }
    }
    if (!phonetic) {
      phonetic = apiEntry.phonetics.find((p: any) => p.text)?.text
    }
  }

  return {
    word: apiEntry.word,
    lemma: apiEntry.word.toLowerCase(),
    phonetic,
    audioUrl,
    definitions,
    examples: examples.length > 0 ? examples : undefined,
  }
}

watch(
  () => props.word,
  (newWord) => {
    if (newWord) {
      lookupWord(newWord)
    }
  },
  { immediate: true }
)

const addToVocabulary = () => {
  // TODO: 添加到生词本
  alert(`已添加 "${props.word}" 到生词本`)
}

const playAudio = () => {
  if (entry.value?.audioUrl) {
    if (!audioElement.value) {
      audioElement.value = new Audio()
    }
    audioElement.value.src = entry.value.audioUrl
    audioElement.value.play()
  }
}

const handleTranslate = async () => {
  if (!props.context) return
  isTranslating.value = true
  try {
    translation.value = await translate(props.context)
  } finally {
    isTranslating.value = false
  }
}
</script>

<template>
  <div class="dictionary-popup">
    <!-- 背景遮罩 -->
    <div class="fixed inset-0 z-[9998] bg-black/20" @click.stop="emit('close')"></div>
    <!-- 弹窗内容 -->
    <div
      class="fixed z-[9999] w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
      :style="{ left: safePosition.x + 'px', top: safePosition.y + 'px' }"
      @click.stop
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold text-lg">{{ word }}</h3>
        <button class="text-gray-400 hover:text-red-500 text-xl leading-none" @click="emit('close')">
          ×
        </button>
      </div>

      <div v-if="isLoading" class="py-4 text-center text-gray-500">
        查询中...
      </div>

      <div v-else-if="entry || aiMeaning">
        <div v-if="entry?.phonetic" class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{{ entry.phonetic }}</span>
          <button v-if="entry.audioUrl" class="hover:text-blue-500" @click="playAudio">🔊</button>
        </div>

        <!-- AI 中文释义 -->
        <div v-if="aiMeaning" class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
          <span class="text-xs text-blue-600 dark:text-blue-400 font-medium">AI 释义：</span>
          {{ aiMeaning }}
        </div>
        <div v-else-if="ollamaLoading" class="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-500">
          AI 正在分析...
        </div>

        <div v-if="entry" class="space-y-2">
          <div v-for="(def, idx) in entry.definitions.slice(0, 3)" :key="idx">
            <span class="text-xs text-blue-500 mr-2 font-medium">{{ def.partOfSpeech }}</span>
            <span class="text-gray-700 dark:text-gray-300">{{ def.meaning }}</span>
          </div>
        </div>

        <div v-if="entry?.examples?.length" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p class="text-xs text-gray-500 mb-1">例句</p>
          <p v-for="(ex, idx) in entry.examples.slice(0, 2)" :key="idx" class="text-sm italic text-gray-600 dark:text-gray-400">
            {{ ex }}
          </p>
        </div>

        <!-- 翻译结果 -->
        <div v-if="translation" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p class="text-xs text-gray-500 mb-1">翻译</p>
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ translation }}</p>
        </div>
      </div>

      <div v-else class="py-4 text-center text-gray-500">未找到释义</div>

      <div class="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <button class="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" @click="addToVocabulary">
          加入生词本
        </button>
        <button
          class="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          :disabled="!context || isTranslating"
          @click="handleTranslate"
        >
          {{ isTranslating ? '翻译中...' : '翻译句子' }}
        </button>
      </div>
    </div>
  </div>
</template>
