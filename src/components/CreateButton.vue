<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    label: string
    mobileFull?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    mobileFull: true,
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (event.defaultPrevented) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70',
      mobileFull ? 'w-full sm:w-auto' : 'w-auto',
    ]"
    @click="handleClick"
  >
    <Plus :size="16" />
    {{ label }}
  </button>
</template>

<style scoped></style>
