<script setup lang="ts">
import { onMounted } from 'vue'
import { useVocabularyStore } from '@/stores/vocabulary'

const vocabStore = useVocabularyStore()

onMounted(() => {
  vocabStore.fetchVocabulary()
})

const getMasteryLabel = (level: number) => {
  const labels = ['陌生', '认识', '熟悉', '掌握']
  return labels[level] || labels[0]
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">生词本</h1>
      <span class="text-[var(--color-text-secondary)]"> {{ vocabStore.items.length }} 个单词 </span>
    </div>

    <div
      v-if="vocabStore.items.length === 0"
      class="text-center py-12 text-[var(--color-text-secondary)]"
    >
      <p class="text-4xl mb-4">📖</p>
      <p>暂无生词</p>
      <p class="text-sm mt-2">阅读时划词查询会自动添加到生词本</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in vocabStore.items" :key="item.id" class="card flex items-center gap-4">
        <div class="flex-1">
          <h3 class="font-medium">{{ item.displayWord }}</h3>
          <p v-if="item.contextSnippet" class="text-sm text-[var(--color-text-secondary)] mt-1">
            {{ item.contextSnippet }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-2 py-1 text-xs rounded"
            :class="{
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                item.masteryLevel === 0,
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400':
                item.masteryLevel === 1,
              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':
                item.masteryLevel === 2,
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                item.masteryLevel === 3,
            }"
          >
            {{ getMasteryLabel(item.masteryLevel) }}
          </span>

          <button
            class="p-1 text-[var(--color-text-secondary)] hover:text-red-500"
            @click="vocabStore.removeWord(item.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
