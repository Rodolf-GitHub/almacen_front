<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { Search } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    buttonLabel?: string
    disabled?: boolean
    showActions?: boolean
    autoSearchDelay?: number
  }>(),
  {
    placeholder: 'Buscar...',
    buttonLabel: 'Buscar',
    disabled: false,
    showActions: true,
    autoSearchDelay: 0,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search'): void
  (e: 'clear'): void
}>()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const scheduleAutoSearch = () => {
  if (props.autoSearchDelay <= 0 || props.disabled) return

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    emit('search')
  }, props.autoSearchDelay)
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  scheduleAutoSearch()
}

const handleSubmit = () => {
  if (props.disabled) return
  emit('search')
}

const clear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <form class="w-full" @submit.prevent="handleSubmit">
    <div
      class="flex w-full items-center gap-3 rounded-xl border-2 border-sky-300 bg-gradient-to-r from-white to-sky-50 px-4 py-3 shadow-md focus-within:border-sky-500"
    >
      <Search :size="20" class="shrink-0 text-sky-600" />
      <input
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full bg-transparent text-base font-medium text-sky-900 outline-none placeholder:text-sky-500 disabled:opacity-70"
        @input="onInput"
      />
      <button
        v-if="showActions"
        type="submit"
        :disabled="disabled"
        class="rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-medium text-sky-700 disabled:opacity-70"
      >
        {{ buttonLabel }}
      </button>
      <button
        v-if="showActions && modelValue"
        type="button"
        :disabled="disabled"
        class="rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-medium text-sky-700 disabled:opacity-70"
        @click="clear"
      >
        Limpiar
      </button>
    </div>
  </form>
</template>

<style scoped></style>
