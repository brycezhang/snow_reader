<script setup lang="ts">
import { ref } from 'vue'

const stats = ref({
  totalReadingMinutes: 0,
  totalWords: 0,
  booksCompleted: 0,
  articlesRead: 0,
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">阅读统计</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-500">{{ stats.totalReadingMinutes }}</p>
        <p class="text-sm text-[var(--color-text-secondary)]">阅读分钟</p>
      </div>

      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-500">{{ stats.totalWords }}</p>
        <p class="text-sm text-[var(--color-text-secondary)]">查词次数</p>
      </div>

      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-500">{{ stats.booksCompleted }}</p>
        <p class="text-sm text-[var(--color-text-secondary)]">完成书籍</p>
      </div>

      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-500">{{ stats.articlesRead }}</p>
        <p class="text-sm text-[var(--color-text-secondary)]">阅读文章</p>
      </div>
    </div>

    <section class="card">
      <h2 class="font-semibold mb-4">本周阅读</h2>
      <div class="h-48 flex items-center justify-center text-[var(--color-text-secondary)]">
        <p>暂无数据</p>
        <!-- TODO: 图表组件 -->
      </div>
    </section>
  </div>
</template>
