<script setup lang="ts">
import { useLibraryStore } from '@/stores/library'

const libraryStore = useLibraryStore()
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="libraryStore.articles.length === 0"
      class="text-center py-12 text-[var(--color-text-secondary)]"
    >
      <p class="text-4xl mb-4">📄</p>
      <p>暂无文章</p>
      <p class="text-sm mt-2">使用 Chrome 插件将网页投递到这里</p>
    </div>

    <div v-else class="space-y-3">
      <RouterLink
        v-for="article in libraryStore.articles"
        :key="article.id"
        :to="`/reader/article/${article.id}`"
        class="card block hover:shadow-md transition-shadow"
      >
        <h3 class="font-medium mb-1">{{ article.title }}</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">
          {{ article.sourceUrl }}
        </p>
        <div class="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-secondary)]">
          <span>{{ article.readingTime }} 分钟</span>
          <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
