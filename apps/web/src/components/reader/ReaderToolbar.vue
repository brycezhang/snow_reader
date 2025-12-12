<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  bookId: string
}>()

const router = useRouter()

const goBack = () => {
  router.push('/library/books')
}
</script>

<template>
  <div
    class="h-12 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]"
  >
    <button
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      @click="goBack"
    >
      ← 返回
    </button>

    <div class="flex items-center gap-2">
      <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">目录</button>
      <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">设置</button>
      <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">书签</button>
    </div>
  </div>
</template>
