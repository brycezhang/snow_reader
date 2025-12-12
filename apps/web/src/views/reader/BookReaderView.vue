<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ReaderSidebar from '@/components/reader/ReaderSidebar.vue'
import EpubViewer from '@/components/reader/EpubViewer.vue'
import DictionaryPopup from '@/components/reader/DictionaryPopup.vue'
import { useReaderStore } from '@/stores/reader'

const route = useRoute()
const bookId = route.params.id as string

const readerStore = useReaderStore()
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

// 词典弹窗
const showDictionary = ref(false)
const selectedWord = ref('')
const selectedContext = ref('')
const popupPosition = ref({ x: 0, y: 0 })
const popupKey = ref(0)

const handleWordClick = (word: string, context: string, position: { x: number; y: number }) => {
  selectedWord.value = word
  selectedContext.value = context
  popupPosition.value = position
  popupKey.value++
  showDictionary.value = true
}

const closeDictionary = () => {
  showDictionary.value = false
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
          @word-click="handleWordClick"
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

    <!-- 词典弹窗 -->
    <Teleport to="body">
      <DictionaryPopup
        v-if="showDictionary"
        :key="popupKey"
        :word="selectedWord"
        :context="selectedContext"
        :position="popupPosition"
        @close="closeDictionary"
      />
    </Teleport>
  </div>
</template>
