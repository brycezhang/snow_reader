<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()

const navItems = [
  { name: '首页', path: '/', icon: 'home' },
  { name: '书架', path: '/library/books', icon: 'book' },
  { name: '文章', path: '/library/articles', icon: 'article' },
  { name: '生词本', path: '/vocabulary', icon: 'vocabulary' },
  { name: '笔记', path: '/notes', icon: 'notes' },
  { name: '统计', path: '/stats', icon: 'stats' },
  { name: '设置', path: '/settings', icon: 'settings' },
]

const isActive = (path: string) => {
  return computed(() => route.path.startsWith(path) || route.path === path)
}
</script>

<template>
  <aside
    class="bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <div class="p-4">
      <h1
        class="text-xl font-bold text-primary-500 whitespace-nowrap overflow-hidden"
        :class="collapsed ? 'text-center' : ''"
      >
        {{ collapsed ? 'SR' : 'Snow Reader' }}
      </h1>
    </div>

    <nav class="mt-4 px-2">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.path">
          <RouterLink
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[
              isActive(item.path).value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800',
            ]"
          >
            <span class="w-5 h-5 flex items-center justify-center">
              {{ item.icon.charAt(0).toUpperCase() }}
            </span>
            <span v-if="!collapsed" class="truncate">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
