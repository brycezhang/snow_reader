<script setup lang="ts">
import { computed } from 'vue'
import { useReaderStore, COLOR_SCHEMES, type ColorScheme, type VocabLevel } from '@/stores/reader'

const readerStore = useReaderStore()

const colorSchemes = computed(() => Object.values(COLOR_SCHEMES))

const vocabLevelLabels: Record<VocabLevel, { label: string; color: string }> = {
  basic: { label: '基础词汇', color: '#ef4444' },
  advanced: { label: '高级词汇', color: '#f97316' },
  professional: { label: '专业词汇', color: '#3b82f6' },
  other: { label: '其他词汇', color: '#8b5cf6' },
}

const handleChapterClick = (href: string) => {
  emit('navigate', href)
}

const emit = defineEmits<{
  navigate: [href: string]
}>()
</script>

<template>
  <aside
    class="w-64 h-full flex flex-col overflow-hidden"
    :style="{ backgroundColor: readerStore.currentColorScheme.sidebar }"
  >
    <!-- 书籍信息 -->
    <div class="p-4 border-b border-white/10">
      <h1 class="text-white font-bold text-lg truncate">
        {{ readerStore.bookTitle || '未加载书籍' }}
      </h1>
      <p class="text-white/70 text-sm truncate">
        {{ readerStore.bookAuthor }}
      </p>
    </div>

    <!-- 词汇注释级别 -->
    <div class="p-4 border-b border-white/10">
      <h2 class="text-white/80 text-xs uppercase tracking-wider mb-3">词汇注释级别</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(config, level) in vocabLevelLabels"
          :key="level"
          class="px-3 py-1.5 rounded text-xs font-medium transition-all"
          :class="
            readerStore.vocabLevels[level as VocabLevel]
              ? 'text-white shadow-sm'
              : 'text-white/50 bg-white/5'
          "
          :style="{
            backgroundColor: readerStore.vocabLevels[level as VocabLevel] ? config.color : undefined,
          }"
          @click="readerStore.toggleVocabLevel(level as VocabLevel)"
        >
          {{ config.label }}
        </button>
      </div>
    </div>

    <!-- 配色方案 -->
    <div class="p-4 border-b border-white/10">
      <h2 class="text-white/80 text-xs uppercase tracking-wider mb-3">COLOR SCHEME</h2>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="scheme in colorSchemes"
          :key="scheme.name"
          class="flex items-center gap-2 px-2 py-2 rounded text-xs transition-all"
          :class="
            readerStore.colorScheme === scheme.name
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          "
          @click="readerStore.setColorScheme(scheme.name as ColorScheme)"
        >
          <span
            class="w-4 h-4 rounded-full border border-white/30"
            :style="{ backgroundColor: scheme.accent }"
          ></span>
          <span class="truncate">{{ scheme.label }}</span>
        </button>
      </div>
    </div>

    <!-- 字体设置 -->
    <div class="p-4 border-b border-white/10">
      <h2 class="text-white/80 text-xs uppercase tracking-wider mb-3">字体</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="font in readerStore.FONT_FAMILIES"
          :key="font.value"
          class="px-3 py-1.5 rounded text-xs transition-all"
          :class="
            readerStore.fontFamily === font.value
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          "
          @click="readerStore.setFontFamily(font.value)"
        >
          {{ font.label }}
        </button>
      </div>
      <!-- 字号调节 -->
      <div class="mt-3 flex items-center gap-2">
        <button
          class="w-8 h-8 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
          @click="readerStore.setFontSize(Math.max(12, readerStore.fontSize - 2))"
        >
          A-
        </button>
        <span class="text-white/70 text-xs flex-1 text-center">{{ readerStore.fontSize }}px</span>
        <button
          class="w-8 h-8 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
          @click="readerStore.setFontSize(Math.min(32, readerStore.fontSize + 2))"
        >
          A+
        </button>
      </div>
    </div>

    <!-- 目录 -->
    <div class="flex-1 overflow-y-auto">
      <nav class="p-2">
        <button
          v-for="(item, index) in readerStore.toc"
          :key="index"
          class="w-full text-left px-3 py-2 rounded text-sm transition-colors"
          :class="[
            readerStore.currentChapterIndex === index
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          :style="{ paddingLeft: `${12 + item.level * 16}px` }"
          @click="handleChapterClick(item.href)"
        >
          {{ item.label }}
        </button>
      </nav>
    </div>

    <!-- 阅读进度 -->
    <div class="p-4 border-t border-white/10">
      <div class="flex items-center justify-between text-white/70 text-xs mb-2">
        <span>阅读进度</span>
        <span>{{ readerStore.progress }}%</span>
      </div>
      <div class="h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-300"
          :style="{
            width: `${readerStore.progress}%`,
            backgroundColor: readerStore.currentColorScheme.accent,
          }"
        ></div>
      </div>
    </div>
  </aside>
</template>
