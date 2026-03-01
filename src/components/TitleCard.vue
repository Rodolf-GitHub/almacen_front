<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>

<template>
  <div
    class="w-full rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-100/70 via-blue-50 to-cyan-50 p-4 text-center shadow-sm sm:p-5 sm:text-left"
  >
    <h1 class="text-2xl font-bold text-sky-900 sm:text-3xl">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-sky-700/90 sm:text-base">{{ description }}</p>
  </div>
</template>

<style scoped></style>
