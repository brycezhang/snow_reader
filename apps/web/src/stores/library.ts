import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book, Article } from '@/types'

export const useLibraryStore = defineStore('library', () => {
  const books = ref<Book[]>([])
  const articles = ref<Article[]>([])
  const isLoading = ref(false)

  const fetchBooks = async () => {
    isLoading.value = true
    try {
      // TODO: 调用后端 API
      books.value = []
    } finally {
      isLoading.value = false
    }
  }

  const fetchArticles = async () => {
    isLoading.value = true
    try {
      // TODO: 调用后端 API
      articles.value = []
    } finally {
      isLoading.value = false
    }
  }

  const uploadBook = async (_file: File) => {
    // TODO: 上传 EPUB 文件
  }

  const deleteBook = async (_id: string) => {
    // TODO: 删除书籍
  }

  return {
    books,
    articles,
    isLoading,
    fetchBooks,
    fetchArticles,
    uploadBook,
    deleteBook,
  }
})
