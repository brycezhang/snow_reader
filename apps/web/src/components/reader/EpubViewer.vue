<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useEpubReader } from '@/composables/useEpubReader'
import { useReaderStore } from '@/stores/reader'
import { lookupWord } from '@/data/vocab-levels'

const props = defineProps<{
  bookUrl?: string
  bookData?: ArrayBuffer | null
}>()

const emit = defineEmits<{
  loaded: []
  error: [message: string]
  wordClick: [word: string, context: string, position: { x: number; y: number }]
}>()

const readerStore = useReaderStore()
const { book, rendition, isLoading, error, loadBook, renderTo, applyTheme, nextPage, prevPage, goToChapter } =
  useEpubReader()

const viewerRef = ref<HTMLElement>()

// 加载书籍
const loadEpub = async () => {
  const source = props.bookData || props.bookUrl
  if (!source) return

  try {
    await loadBook(source)

    if (viewerRef.value) {
      await nextTick()
      const rend = renderTo(viewerRef.value, { spread: 'auto' })

      // 应用初始主题
      applyCurrentTheme()

      // 监听渲染完成，注入注释
      rend.on('rendered', () => {
        injectAnnotations()
      })

      emit('loaded')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '加载失败'
    emit('error', message)
  }
}

// 应用当前主题
const applyCurrentTheme = () => {
  if (!rendition.value) return

  const fontCSS = readerStore.getCurrentFontCSS()

  rendition.value.themes.default({
    body: {
      background: readerStore.currentColorScheme.bg,
      color: readerStore.currentColorScheme.text,
      'font-size': `${readerStore.fontSize}px`,
      'line-height': `${readerStore.lineHeight}`,
      'font-family': fontCSS,
    },
    p: {
      'font-size': `${readerStore.fontSize}px`,
      'line-height': `${readerStore.lineHeight}`,
      'font-family': fontCSS,
    },
  })
}

// 注入词汇注释
const injectAnnotations = () => {
  if (!rendition.value) return

  const contents = rendition.value.getContents()
  contents.forEach((content: { document: Document }) => {
    const doc = content.document
    if (!doc) return

    // 获取所有文本节点
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
    const textNodes: Text[] = []

    let node: Node | null
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text)
      }
    }

    // 处理每个文本节点
    textNodes.forEach((textNode) => {
      processTextNode(textNode, doc)
    })
  })
}

// 处理单个文本节点，添加注释
const processTextNode = (textNode: Text, doc: Document) => {
  const text = textNode.textContent || ''
  const wordPattern = /\b([a-zA-Z]+)\b/g
  const parts: (string | { word: string; annotation: string })[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = wordPattern.exec(text)) !== null) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const word = match[1]
    const entry = lookupWord(word)

    // 检查是否需要显示注释
    if (entry && shouldShowAnnotation(entry.level)) {
      parts.push({ word, annotation: entry.meaning })
    } else {
      parts.push(word)
    }

    lastIndex = match.index + match[0].length
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  // 如果有需要注释的词，替换节点
  if (parts.some((p) => typeof p === 'object')) {
    const fragment = doc.createDocumentFragment()

    parts.forEach((part) => {
      if (typeof part === 'string') {
        fragment.appendChild(doc.createTextNode(part))
      } else {
        const wrapper = doc.createElement('ruby')
        wrapper.className = 'snow-annotation'
        wrapper.style.cssText = 'ruby-position: over; ruby-align: center;'

        const wordSpan = doc.createElement('span')
        wordSpan.textContent = part.word
        wordSpan.style.cssText = 'cursor: pointer;'
        wordSpan.dataset.word = part.word

        // 点击单词触发词典弹窗
        wordSpan.addEventListener('click', (e) => {
          e.stopPropagation()
          const rect = wordSpan.getBoundingClientRect()
          const iframe = viewerRef.value?.querySelector('iframe')
          const iframeRect = iframe?.getBoundingClientRect() || { left: 0, top: 0 }
          
          // 获取上下文（单词所在句子）
          const sentence = getSentenceContext(wordSpan)
          
          emit('wordClick', part.word, sentence, {
            x: rect.left + iframeRect.left,
            y: rect.bottom + iframeRect.top + 5,
          })
        })

        const rt = doc.createElement('rt')
        rt.textContent = part.annotation
        rt.style.cssText = `
          font-size: 0.6em;
          color: ${readerStore.currentColorScheme.accent};
          font-weight: normal;
        `

        wrapper.appendChild(wordSpan)
        wrapper.appendChild(rt)
        fragment.appendChild(wrapper)
      }
    })

    textNode.parentNode?.replaceChild(fragment, textNode)
  }
}

// 获取单词所在的句子上下文
const getSentenceContext = (element: HTMLElement): string => {
  let parent = element.parentElement
  while (parent && !['P', 'DIV', 'SPAN', 'LI', 'TD', 'BLOCKQUOTE'].includes(parent.tagName)) {
    parent = parent.parentElement
  }
  const text = parent?.textContent || element.textContent || ''
  // 截取单词前后的句子
  const sentences = text.split(/[.!?]\s*/)
  const word = element.textContent || ''
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(word.toLowerCase())) {
      return sentence.trim()
    }
  }
  return text.slice(0, 200)
}

// 判断是否应该显示注释
const shouldShowAnnotation = (level: string): boolean => {
  const levels = readerStore.vocabLevels
  return (
    (level === 'basic' && levels.basic) ||
    (level === 'advanced' && levels.advanced) ||
    (level === 'professional' && levels.professional) ||
    (level === 'other' && levels.other)
  )
}

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault()
    nextPage()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    prevPage()
  }
}

// 点击翻页
const handleClick = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width

  if (x < width * 0.3) {
    prevPage()
  } else if (x > width * 0.7) {
    nextPage()
  }
}

// 暴露方法给父组件
defineExpose({
  nextPage,
  prevPage,
  goToChapter,
  reload: loadEpub,
})

// 监听书籍源变化
watch(
  () => [props.bookUrl, props.bookData],
  () => {
    loadEpub()
  }
)

// 监听配色方案变化
watch(
  () => readerStore.colorScheme,
  () => {
    applyCurrentTheme()
    // 重新注入注释以更新颜色
    nextTick(() => {
      injectAnnotations()
    })
  }
)

// 监听字体和字号变化
watch(
  () => [readerStore.fontFamily, readerStore.fontSize],
  () => {
    applyCurrentTheme()
  }
)

// 监听词汇级别变化 - 需要重新渲染页面
watch(
  () => ({ ...readerStore.vocabLevels }),
  async () => {
    if (rendition.value) {
      const currentLocation = rendition.value.currentLocation()
      if (currentLocation?.start?.cfi) {
        // 重新显示当前位置，触发 rendered 事件
        await rendition.value.display(currentLocation.start.cfi)
      }
    }
  },
  { deep: true }
)

onMounted(() => {
  readerStore.initFromStorage()
  loadEpub()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="viewerRef"
    class="w-full h-full relative"
    :style="{ backgroundColor: readerStore.currentColorScheme.bg }"
    @click="handleClick"
  >
    <!-- 加载中 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center"
      :style="{ backgroundColor: readerStore.currentColorScheme.bg }"
    >
      <div class="text-center">
        <div
          class="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          :style="{ borderColor: readerStore.currentColorScheme.accent }"
        ></div>
        <p :style="{ color: readerStore.currentColorScheme.text }">加载中...</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center"
      :style="{ backgroundColor: readerStore.currentColorScheme.bg }"
    >
      <div class="text-center">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button
          class="px-4 py-2 rounded"
          :style="{
            backgroundColor: readerStore.currentColorScheme.accent,
            color: '#fff',
          }"
          @click="loadEpub"
        >
          重试
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* epub.js 容器样式 */
.epub-container {
  height: 100% !important;
}
</style>
