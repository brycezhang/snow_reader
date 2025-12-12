<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import DictionaryPopup from '@/components/reader/DictionaryPopup.vue'

const route = useRoute()
const _articleId = route.params.id as string

const showDictionary = ref(false)
const selectedWord = ref('')
const popupPosition = ref({ x: 0, y: 0 })

const handleTextSelection = (_event: MouseEvent) => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedWord.value = selection.toString().trim()
    showDictionary.value = true
  }
}

const closeDictionary = () => {
  showDictionary.value = false
  selectedWord.value = ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <article class="prose dark:prose-dark" @mouseup="handleTextSelection">
      <p class="text-[var(--color-text-secondary)]">文章内容加载中...</p>
      <!-- TODO: 渲染文章内容 -->
    </article>

    <DictionaryPopup
      v-if="showDictionary"
      :word="selectedWord"
      :position="popupPosition"
      @close="closeDictionary"
    />
  </div>
</template>
