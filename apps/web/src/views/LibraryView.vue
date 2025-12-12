<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const tabs = [
  { name: '电子书', path: '/library/books' },
  { name: '文章', path: '/library/articles' },
]

const activeTab = computed(() => route.path)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">我的书架</h1>
    </div>

    <nav class="flex gap-4 border-b border-[var(--color-border)]">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="px-4 py-2 -mb-px border-b-2 transition-colors"
        :class="
          activeTab === tab.path
            ? 'border-primary-500 text-primary-500'
            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        "
      >
        {{ tab.name }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
