<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useOllama } from '@/composables/useOllama'

const themeStore = useThemeStore()
const { translate, lookupWord: ollamaLookup, isLoading: ollamaLoading } = useOllama()

onMounted(() => {
  themeStore.initTheme()
  document.addEventListener('mouseup', handleTextSelection)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleTextSelection)
})

// 选中文字弹出词典
const showDictionary = ref(false)
const selectedWord = ref('')
const selectedContext = ref('')
const popupPosition = ref({ x: 0, y: 0 })
const aiMeaning = ref('')
const translation = ref('')
const isTranslating = ref(false)

const handleTextSelection = async (e: MouseEvent) => {
  // 如果点击的是弹窗内部，不处理
  if ((e.target as HTMLElement).closest('.dictionary-popup')) {
    return
  }
  
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  
  // 只处理单词（英文字母）
  if (text && /^[a-zA-Z]+$/.test(text)) {
    selectedWord.value = text
    
    // 获取上下文
    const range = selection?.getRangeAt(0)
    const container = range?.commonAncestorContainer
    selectedContext.value = container?.textContent?.slice(0, 200) || ''
    
    // 设置弹窗位置
    const maxX = window.innerWidth - 340
    const maxY = window.innerHeight - 300
    popupPosition.value = {
      x: Math.min(e.clientX, maxX),
      y: Math.min(e.clientY + 10, maxY)
    }
    showDictionary.value = true
    
    // 查词
    await lookupWord(text)
  } else if (!text) {
    showDictionary.value = false
  }
}

const lookupWord = async (word: string) => {
  aiMeaning.value = ''
  translation.value = ''
  
  // 只用 Ollama 查词
  ollamaLookup(word, selectedContext.value).then((meaning) => {
    aiMeaning.value = meaning
  })
}

const handleTranslate = async () => {
  if (!selectedContext.value) return
  isTranslating.value = true
  try {
    translation.value = await translate(selectedContext.value)
  } finally {
    isTranslating.value = false
  }
}

const closeDictionary = () => {
  showDictionary.value = false
}
</script>

<template>
  <div class="space-y-8">
    <section>
      <h2 class="text-2xl font-bold mb-4">欢迎使用 Snow Reader</h2>
      <p class="text-[var(--color-text-secondary)]">
        英文电子书/网页阅读与学习器，支持 EPUB 阅读、划词查词、行内注释、生词本等功能。
      </p>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="card">
        <h3 class="font-semibold mb-2">📚 继续阅读</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">暂无阅读记录</p>
      </div>

      <div class="card">
        <h3 class="font-semibold mb-2">📝 最近笔记</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">暂无笔记</p>
      </div>

      <div class="card">
        <h3 class="font-semibold mb-2">📖 生词本</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">暂无生词</p>
      </div>
    </section>

    <section>
      <h3 class="text-lg font-semibold mb-4">快速开始</h3>
      <div class="flex flex-wrap gap-3">
        <RouterLink to="/library/books" class="btn-primary"> 上传 EPUB </RouterLink>
        <RouterLink to="/settings" class="btn-secondary"> 设置偏好 </RouterLink>
      </div>
    </section>

    <!-- 划词翻译测试区 -->
    <section class="card">
      <h3 class="font-semibold mb-3">🔍 划词翻译测试</h3>
      <p class="text-sm text-[var(--color-text-secondary)] mb-3">
        选中下方英文单词即可查看释义：
      </p>
      <p class="text-lg leading-relaxed select-text">
        The <span class="text-blue-600 font-medium">serendipity</span> of finding exactly what you need 
        when you least expect it is one of life's greatest <span class="text-blue-600 font-medium">pleasures</span>. 
        This <span class="text-blue-600 font-medium">phenomenon</span> often leads to unexpected 
        <span class="text-blue-600 font-medium">discoveries</span> and meaningful 
        <span class="text-blue-600 font-medium">connections</span>.
      </p>
      <p class="text-xs text-[var(--color-text-secondary)] mt-3">
        ✅ Ollama (qwen3:4b) 提供 AI 中文释义和句子翻译
      </p>
    </section>

    <!-- 词典弹窗 -->
    <Teleport to="body">
      <div v-if="showDictionary" class="dictionary-popup">
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 z-[9998] bg-black/20" @click="closeDictionary"></div>
        <!-- 弹窗 -->
        <div
          class="fixed z-[9999] w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
          :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
          @click.stop
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-lg">{{ selectedWord }}</h3>
            <button class="text-gray-400 hover:text-red-500 text-xl" @click="closeDictionary">×</button>
          </div>
          
          <!-- AI 释义 -->
          <div v-if="aiMeaning" class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
            {{ aiMeaning }}
          </div>
          <div v-else-if="ollamaLoading" class="py-4 text-center text-gray-500">
            AI 正在分析...
          </div>
          <div v-else class="py-4 text-center text-gray-500">
            等待查询...
          </div>
          
          <!-- 翻译结果 -->
          <div v-if="translation" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p class="text-xs text-gray-500 mb-1">翻译</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ translation }}</p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              class="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              :disabled="isTranslating"
              @click="handleTranslate"
            >
              {{ isTranslating ? '翻译中...' : '翻译句子' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
