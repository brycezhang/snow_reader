<script setup lang="ts">
import { ref } from 'vue'
import type { Note, Highlight } from '@/types'

const notes = ref<(Note & { highlight: Highlight })[]>([])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">笔记</h1>
    </div>

    <div
      v-if="notes.length === 0"
      class="text-center py-12 text-[var(--color-text-secondary)]"
    >
      <p class="text-4xl mb-4">📝</p>
      <p>暂无笔记</p>
      <p class="text-sm mt-2">阅读时选中文本可以添加笔记</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="note in notes" :key="note.id" class="card">
        <blockquote class="border-l-4 border-primary-500 pl-4 mb-3 italic text-[var(--color-text-secondary)]">
          {{ note.highlight.text }}
        </blockquote>
        <p>{{ note.text }}</p>
        <div class="flex items-center gap-2 mt-3 text-xs text-[var(--color-text-secondary)]">
          <span v-for="tag in note.tags" :key="tag" class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
            {{ tag }}
          </span>
          <span class="ml-auto">{{ new Date(note.createdAt).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
