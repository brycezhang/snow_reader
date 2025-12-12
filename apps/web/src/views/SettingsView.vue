<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { ReaderPreferences } from '@/types'

const themeStore = useThemeStore()

const preferences = ref<ReaderPreferences>({
  fontSize: 16,
  lineHeight: 1.8,
  margin: 20,
  theme: 'light',
  fontFamily: 'serif',
})

const fontFamilies = [
  { value: 'serif', label: '衬线字体' },
  { value: 'sans', label: '无衬线字体' },
]

const themes = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'sepia', label: '护眼' },
]
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <h1 class="text-2xl font-bold">设置</h1>

    <section class="card space-y-4">
      <h2 class="font-semibold">外观</h2>

      <div class="flex items-center justify-between">
        <span>深色模式</span>
        <button
          class="w-12 h-6 rounded-full transition-colors"
          :class="themeStore.isDark ? 'bg-primary-500' : 'bg-gray-300'"
          @click="themeStore.toggleTheme"
        >
          <span
            class="block w-5 h-5 bg-white rounded-full shadow transition-transform"
            :class="themeStore.isDark ? 'translate-x-6' : 'translate-x-0.5'"
          />
        </button>
      </div>
    </section>

    <section class="card space-y-4">
      <h2 class="font-semibold">阅读偏好</h2>

      <div>
        <label class="block text-sm mb-2">字体大小: {{ preferences.fontSize }}px</label>
        <input
          v-model.number="preferences.fontSize"
          type="range"
          min="12"
          max="24"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm mb-2">行高: {{ preferences.lineHeight }}</label>
        <input
          v-model.number="preferences.lineHeight"
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm mb-2">字体</label>
        <select v-model="preferences.fontFamily" class="input">
          <option v-for="font in fontFamilies" :key="font.value" :value="font.value">
            {{ font.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-2">阅读主题</label>
        <div class="flex gap-2">
          <button
            v-for="theme in themes"
            :key="theme.value"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="
              preferences.theme === theme.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-[var(--color-border)]'
            "
            @click="preferences.theme = theme.value as ReaderPreferences['theme']"
          >
            {{ theme.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="card space-y-4">
      <h2 class="font-semibold">离线词典</h2>
      <p class="text-sm text-[var(--color-text-secondary)]">
        下载离线词典包后，无网络时也可查词
      </p>
      <div class="flex gap-2">
        <button class="btn-secondary">下载精简包 (约 20MB)</button>
        <button class="btn-secondary">下载完整包 (约 100MB)</button>
      </div>
    </section>
  </div>
</template>
