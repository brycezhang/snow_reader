<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ReaderSidebar from '@/components/reader/ReaderSidebar.vue'
import EpubViewer from '@/components/reader/EpubViewer.vue'
import { useReaderStore } from '@/stores/reader'
import { useOllama } from '@/composables/useOllama'

const route = useRoute()
const bookId = route.params.id as string

const readerStore = useReaderStore()
const { translate, lookupWord } = useOllama()
const epubViewerRef = ref<InstanceType<typeof EpubViewer>>()

// 书籍数据
const bookData = ref<ArrayBuffer | null>(null)
const hasBook = ref(false)

// 根据 bookId 加载书籍
onMounted(async () => {
  readerStore.initFromStorage()
})

// 处理章节导航
const handleNavigate = (href: string) => {
  epubViewerRef.value?.goToChapter(href)
}

// 处理书籍加载完成
const handleBookLoaded = () => {
  console.log('Book loaded successfully')
}

// 处理错误
const handleError = (message: string) => {
  console.error('Book loading error:', message)
}

// 上传 EPUB 文件
const fileInputRef = ref<HTMLInputElement>()
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  bookData.value = await file.arrayBuffer()
  hasBook.value = true
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

// 浮动菜单
const showMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')

// 翻译弹窗
const showResult = ref(false)
const resultPosition = ref({ x: 0, y: 0 })
const translation = ref('')
const isTranslating = ref(false)

// 处理来自 EpubViewer 的选中事件（显示菜单）
const handleTextSelected = (text: string, position: { x: number; y: number }) => {
  selectedText.value = text
  menuPosition.value = position
  showMenu.value = true
  showResult.value = false
}

// 句子上下文
const sentenceContext = ref('')

// 处理已注释单词点击（直接显示翻译，同时调用 AI 获取更准确的释义）
const handleWordClicked = async (word: string, meaning: string, context: string, position: { x: number; y: number }) => {
  selectedText.value = word
  sentenceContext.value = context
  translation.value = meaning // 先显示词库释义
  showMenu.value = false
  const maxX = window.innerWidth - 340
  const maxY = window.innerHeight - 200
  resultPosition.value = {
    x: Math.min(position.x, maxX),
    y: Math.min(position.y, maxY)
  }
  showResult.value = true
  isTranslating.value = true
  
  // 调用 AI 获取基于上下文的释义
  try {
    const aiMeaning = await lookupWord(word, context)
    if (aiMeaning) {
      translation.value = aiMeaning
    }
  } finally {
    isTranslating.value = false
  }
}

const handleTranslate = async () => {
  if (!selectedText.value) return
  
  // 隐藏菜单，显示结果弹窗
  showMenu.value = false
  const maxX = window.innerWidth - 340
  const maxY = window.innerHeight - 200
  resultPosition.value = {
    x: Math.min(menuPosition.value.x, maxX),
    y: Math.min(menuPosition.value.y + 50, maxY)
  }
  showResult.value = true
  translation.value = ''
  isTranslating.value = true
  
  try {
    translation.value = await translate(selectedText.value)
  } finally {
    isTranslating.value = false
  }
}

const closeResult = () => {
  showResult.value = false
  selectedText.value = ''
}

// 拖动功能
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - resultPosition.value.x,
    y: e.clientY - resultPosition.value.y
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  resultPosition.value = {
    x: Math.max(0, Math.min(e.clientX - dragOffset.value.x, window.innerWidth - 320)),
    y: Math.max(0, Math.min(e.clientY - dragOffset.value.y, window.innerHeight - 100))
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div class="h-screen flex overflow-hidden">
    <!-- 左侧边栏 -->
    <ReaderSidebar @navigate="handleNavigate" />

    <!-- 主阅读区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部工具栏 -->
      <div
        class="h-12 px-4 flex items-center justify-between border-b"
        :style="{
          backgroundColor: readerStore.currentColorScheme.bg,
          borderColor: readerStore.currentColorScheme.text + '20',
        }"
      >
        <div class="flex items-center gap-4">
          <button
            class="p-2 rounded hover:bg-black/5 transition-colors"
            @click="epubViewerRef?.prevPage()"
          >
            ←
          </button>
          <span
            class="text-sm"
            :style="{ color: readerStore.currentColorScheme.text + '99' }"
          >
            {{ readerStore.currentChapter || '选择章节' }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-sm rounded transition-colors"
            :style="{
              backgroundColor: readerStore.currentColorScheme.accent,
              color: '#fff',
            }"
            @click="triggerFileUpload"
          >
            打开书籍
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept=".epub"
            class="hidden"
            @change="handleFileUpload"
          />
        </div>
      </div>

      <!-- EPUB 阅读区 -->
      <div class="flex-1 overflow-hidden">
        <EpubViewer
          v-if="hasBook && bookData"
          ref="epubViewerRef"
          :book-data="bookData"
          @loaded="handleBookLoaded"
          @error="handleError"
          @text-selected="handleTextSelected"
          @word-clicked="handleWordClicked"
        />

        <!-- 空状态 -->
        <div
          v-else
          class="h-full flex items-center justify-center"
          :style="{ backgroundColor: readerStore.currentColorScheme.bg }"
        >
          <div class="text-center">
            <div class="text-6xl mb-6">📚</div>
            <h2
              class="text-xl font-semibold mb-2"
              :style="{ color: readerStore.currentColorScheme.text }"
            >
              欢迎使用 Snow Reader
            </h2>
            <p
              class="mb-6"
              :style="{ color: readerStore.currentColorScheme.text + '99' }"
            >
              点击上方"打开书籍"按钮加载 EPUB 文件
            </p>
            <button
              class="px-6 py-3 rounded-lg font-medium transition-colors"
              :style="{
                backgroundColor: readerStore.currentColorScheme.accent,
                color: '#fff',
              }"
              @click="triggerFileUpload"
            >
              选择 EPUB 文件
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动菜单 -->
    <Teleport to="body">
      <div
        v-if="showMenu"
        class="selection-menu fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-2 py-1"
        :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
      >
        <button
          class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
          @click="handleTranslate"
        >
          🌐 翻译
        </button>
      </div>
    </Teleport>

    <!-- 翻译结果弹窗 -->
    <Teleport to="body">
      <div v-if="showResult" class="translation-popup">
        <!-- 背景遮罩 -->
        <div class="fixed inset-0 z-[9998]" @click="closeResult"></div>
        <!-- 弹窗 -->
        <div
          class="fixed z-[9999] w-80 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
          :style="{ left: resultPosition.x + 'px', top: resultPosition.y + 'px' }"
          @click.stop
        >
          <!-- 可拖动的标题栏 -->
          <div
            class="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-t-xl cursor-move select-none"
            @mousedown="startDrag"
          >
            <span class="text-xs font-medium text-blue-600">AI 翻译</span>
            <button class="text-gray-400 hover:text-red-500 text-lg" @click="closeResult">×</button>
          </div>
          
          <!-- 内容区 -->
          <div class="p-4">
          
          <!-- 原文 -->
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded max-h-24 overflow-y-auto">
            {{ selectedText }}
          </div>
          
          <!-- 翻译结果 -->
          <div v-if="isTranslating" class="py-3 text-center text-gray-500 text-sm">
            翻译中...
          </div>
          <div v-else-if="translation" class="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-gray-800 dark:text-gray-200">
            {{ translation }}
          </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
