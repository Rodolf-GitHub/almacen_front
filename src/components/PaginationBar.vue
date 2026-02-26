<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalItems: number
    pageSize?: number
    disabled?: boolean
  }>(),
  {
    pageSize: 100,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
}>()

const totalPages = computed(() => {
  const pages = Math.ceil((props.totalItems || 0) / props.pageSize)
  return Math.max(1, pages)
})

const canGoPrevious = computed(() => !props.disabled && props.currentPage > 1)
const canGoNext = computed(() => !props.disabled && props.currentPage < totalPages.value)
</script>

<template>
  <nav
    class="flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-2 shadow-sm"
    aria-label="Paginación"
  >
    <button
      type="button"
      :disabled="!canGoPrevious"
      class="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
      @click="emit('previous')"
    >
      <ChevronLeft :size="16" />
      Anterior
    </button>

    <p
      class="rounded-lg border border-sky-100 bg-white px-3 py-1.5 text-sm font-semibold text-sky-800"
    >
      Página {{ currentPage }} de {{ totalPages }}
    </p>

    <button
      type="button"
      :disabled="!canGoNext"
      class="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
      @click="emit('next')"
    >
      Siguiente
      <ChevronRight :size="16" />
    </button>
  </nav>
</template>

<style scoped></style>
