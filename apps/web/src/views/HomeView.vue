<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <div class="space-y-8">
    <section>
      <h2 class="text-2xl font-bold mb-4">欢迎使用 Snow Reader</h2>
      <p class="text-[var(--color-text-secondary)]">
        英文电子书/网页阅读与学习器，支持 EPUB 阅读、划词查词、行内注释、生词本等功能。
      </p>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="card">
        <h3 class="font-semibold mb-2">📚 继续阅读</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">暂无阅读记录</p>
      </div>

      <div class="card">
        <h3 class="font-semibold mb-2">📝 最近笔记</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">暂无笔记</p>
      </div>

      <div class="card">
        <h3 class="font-semibold mb-2">📖 生词本</h3>
        <p class="text-sm text-[var(--color-text-secondary)]">暂无生词</p>
      </div>
    </section>

    <section>
      <h3 class="text-lg font-semibold mb-4">快速开始</h3>
      <div class="flex flex-wrap gap-3">
        <RouterLink to="/library/books" class="btn-primary"> 上传 EPUB </RouterLink>
        <RouterLink to="/settings" class="btn-secondary"> 设置偏好 </RouterLink>
      </div>
    </section>

  </div>
</template>
