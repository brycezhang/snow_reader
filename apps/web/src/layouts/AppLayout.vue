<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="min-h-screen flex">
    <AppSidebar :collapsed="sidebarCollapsed" />

    <div class="flex-1 flex flex-col">
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
