<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    maxWidthClass?: string
  }>(),
  {
    maxWidthClass: 'max-w-2xl',
  },
)

const emit = defineEmits<{ (e: 'close'): void }>()

const close = () => emit('close')
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]"
    @click.self="close"
  >
    <div
      :class="[
        'max-h-[90vh] w-full overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-5 shadow-xl',
        maxWidthClass,
      ]"
    >
      <div class="mb-4 flex items-center justify-between border-b border-sky-100 pb-3">
        <h2 class="text-lg font-semibold text-sky-900">{{ title }}</h2>
        <button
          type="button"
          class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-50"
          @click="close"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="max-h-[72vh] overflow-y-auto pr-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
