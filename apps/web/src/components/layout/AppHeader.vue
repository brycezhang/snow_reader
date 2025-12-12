<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const emit = defineEmits<{
  toggleSidebar: []
}>()

const themeStore = useThemeStore()
</script>

<template>
  <header
    class="h-14 px-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]"
  >
    <button
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      @click="emit('toggleSidebar')"
    >
      <span class="text-lg">☰</span>
    </button>

    <div class="flex items-center gap-4">
      <button
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="themeStore.toggleTheme"
      >
        <span v-if="themeStore.isDark">🌙</span>
        <span v-else>☀️</span>
      </button>

      <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
        U
      </div>
    </div>
  </header>
</template>
