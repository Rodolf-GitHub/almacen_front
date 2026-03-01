<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Tag } from 'lucide-vue-next'
import type {
  CategoriaProductoCreate,
  CategoriaProductoSchema,
  CategoriaProductoUpdate,
} from '../../../api/schemas'
import BaseModal from '../../../components/BaseModal.vue'

const props = defineProps<{
  open: boolean
  categoria?: CategoriaProductoSchema | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', payload: CategoriaProductoCreate): void
  (e: 'updated', payload: { id: number; body: CategoriaProductoUpdate }): void
}>()

const nombre = ref('')

const isEditMode = computed(() => props.categoria?.id != null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    nombre.value = props.categoria?.nombre ?? ''
  },
)

const close = () => emit('close')

const submit = () => {
  const nombreLimpio = nombre.value.trim()
  if (!nombreLimpio) return

  if (isEditMode.value && props.categoria?.id) {
    emit('updated', {
      id: props.categoria.id,
      body: { nombre: nombreLimpio },
    })
    close()
    return
  }

  emit('created', { nombre: nombreLimpio })
  close()
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditMode ? 'Editar categoría' : 'Crear categoría'"
    max-width-class="max-w-md"
    @close="close"
  >
    <form class="space-y-3" @submit.prevent="submit">
      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Tag :size="16" />
          Nombre
        </label>
        <input
          v-model="nombre"
          required
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        />
      </div>

      <div class="flex justify-end gap-2 border-t border-sky-100 pt-3">
        <button
          type="button"
          class="rounded-md border border-sky-200 bg-white px-4 py-2 text-sm text-sky-700 hover:bg-sky-50"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-md bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-medium text-white"
        >
          {{ isEditMode ? 'Guardar' : 'Crear' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped></style>
