<script setup lang="ts">
import { ref } from 'vue'
import { useLibraryStore } from '@/stores/library'

const libraryStore = useLibraryStore()
const fileInput = ref<HTMLInputElement>()

const handleUpload = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.name.endsWith('.epub')) {
    await libraryStore.uploadBook(file)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <button class="btn-primary" @click="handleUpload">上传 EPUB</button>
      <input ref="fileInput" type="file" accept=".epub" class="hidden" @change="onFileSelected" />
    </div>

    <div
      v-if="libraryStore.books.length === 0"
      class="text-center py-12 text-[var(--color-text-secondary)]"
    >
      <p class="text-4xl mb-4">📚</p>
      <p>暂无电子书，点击上方按钮上传</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <RouterLink
        v-for="book in libraryStore.books"
        :key="book.id"
        :to="`/reader/book/${book.id}`"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded mb-2">
          <img
            v-if="book.cover"
            :src="book.cover"
            :alt="book.title"
            class="w-full h-full object-cover rounded"
          />
        </div>
        <h3 class="font-medium text-sm truncate">{{ book.title }}</h3>
        <p class="text-xs text-[var(--color-text-secondary)] truncate">{{ book.author }}</p>
        <div class="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded">
          <div class="h-full bg-primary-500 rounded" :style="{ width: `${book.progress}%` }"></div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
