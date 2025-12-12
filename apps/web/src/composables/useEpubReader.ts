import { ref, onUnmounted } from 'vue'
import ePub, { Book, Rendition, NavItem } from 'epubjs'
import { useReaderStore } from '@/stores/reader'

export interface TocItem {
  label: string
  href: string
  level: number
}

export function useEpubReader() {
  const readerStore = useReaderStore()

  const book = ref<Book | null>(null)
  const rendition = ref<Rendition | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 加载 EPUB 文件
   */
  const loadBook = async (source: string | ArrayBuffer) => {
    isLoading.value = true
    error.value = null

    try {
      // 销毁之前的实例
      if (book.value) {
        book.value.destroy()
      }

      // 创建新的 Book 实例
      book.value = ePub(source)

      // 等待书籍加载完成
      await book.value.ready

      // 获取元数据
      const metadata = await book.value.loaded.metadata
      readerStore.setBook(metadata.title || '未知书名', metadata.creator || '未知作者')

      // 获取目录
      const navigation = await book.value.loaded.navigation
      const tocItems = flattenToc(navigation.toc)
      readerStore.setToc(tocItems)

      isLoading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载书籍失败'
      isLoading.value = false
      throw err
    }
  }

  /**
   * 渲染到指定容器
   */
  const renderTo = (element: HTMLElement, options?: { spread?: 'auto' | 'none' }) => {
    if (!book.value) {
      throw new Error('请先加载书籍')
    }

    // 销毁之前的渲染
    if (rendition.value) {
      rendition.value.destroy()
    }

    // 创建渲染实例
    rendition.value = book.value.renderTo(element, {
      width: '100%',
      height: '100%',
      spread: options?.spread || 'auto',
      flow: 'paginated',
    })

    // 监听位置变化
    rendition.value.on('relocated', (location: { start: { percentage: number; index: number } }) => {
      readerStore.setProgress(Math.round(location.start.percentage * 100))

      // 更新当前章节
      const spine = book.value?.spine
      if (spine && location.start.index !== undefined) {
        const section = spine.get(location.start.index)
        if (section) {
          const tocItem = readerStore.toc.find((t) => section.href.includes(t.href))
          if (tocItem) {
            const index = readerStore.toc.indexOf(tocItem)
            readerStore.setCurrentChapter(index, tocItem.label)
          }
        }
      }
    })

    // 显示书籍
    rendition.value.display()

    return rendition.value
  }

  /**
   * 应用主题样式
   */
  const applyTheme = (theme: { bg: string; text: string; fontSize: number; lineHeight: number }) => {
    if (!rendition.value) return

    rendition.value.themes.default({
      body: {
        background: theme.bg,
        color: theme.text,
        'font-size': `${theme.fontSize}px`,
        'line-height': `${theme.lineHeight}`,
      },
      p: {
        'font-size': `${theme.fontSize}px`,
        'line-height': `${theme.lineHeight}`,
      },
    })
  }

  /**
   * 下一页
   */
  const nextPage = () => {
    rendition.value?.next()
  }

  /**
   * 上一页
   */
  const prevPage = () => {
    rendition.value?.prev()
  }

  /**
   * 跳转到指定章节
   */
  const goToChapter = (href: string) => {
    rendition.value?.display(href)
  }

  /**
   * 跳转到指定位置（CFI）
   */
  const goToLocation = (cfi: string) => {
    rendition.value?.display(cfi)
  }

  /**
   * 获取当前页面内容（用于注释处理）
   */
  const getCurrentContent = async (): Promise<string> => {
    if (!rendition.value) return ''

    const contents = rendition.value.getContents()
    if (contents.length === 0) return ''

    const content = contents[0] as { document: Document }
    return content.document.body.innerHTML
  }

  /**
   * 扁平化目录结构
   */
  const flattenToc = (items: NavItem[], level = 0): TocItem[] => {
    const result: TocItem[] = []

    for (const item of items) {
      result.push({
        label: item.label.trim(),
        href: item.href,
        level,
      })

      if (item.subitems && item.subitems.length > 0) {
        result.push(...flattenToc(item.subitems, level + 1))
      }
    }

    return result
  }

  /**
   * 销毁
   */
  const destroy = () => {
    if (rendition.value) {
      rendition.value.destroy()
      rendition.value = null
    }
    if (book.value) {
      book.value.destroy()
      book.value = null
    }
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    book,
    rendition,
    isLoading,
    error,
    loadBook,
    renderTo,
    applyTheme,
    nextPage,
    prevPage,
    goToChapter,
    goToLocation,
    getCurrentContent,
    destroy,
  }
}
