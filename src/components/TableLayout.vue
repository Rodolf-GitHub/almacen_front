<script setup lang="ts">
withDefaults(
  defineProps<{
    headers: string[]
    loading?: boolean
    loadingText?: string
    empty?: boolean
    emptyText?: string
  }>(),
  {
    loading: false,
    loadingText: 'Cargando...',
    empty: false,
    emptyText: 'Sin datos.',
  },
)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm">
    <table class="w-full table-fixed text-left text-sm">
      <thead class="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800">
        <tr>
          <th v-for="header in headers" :key="header" class="px-2 py-2 font-medium sm:px-3">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-sky-100">
        <tr v-if="loading">
          <td class="px-2 py-3 text-sky-900 sm:px-3" :colspan="headers.length">
            {{ loadingText }}
          </td>
        </tr>
        <tr v-else-if="empty">
          <td class="px-2 py-3 text-sky-900 sm:px-3" :colspan="headers.length">
            {{ emptyText }}
          </td>
        </tr>
        <slot v-else />
      </tbody>
    </table>
  </div>
</template>

<style scoped></style>
