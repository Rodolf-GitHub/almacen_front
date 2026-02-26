<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Building2, Phone, Tag } from 'lucide-vue-next'
import BaseModal from '../../../components/BaseModal.vue'
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../../../api/schemas'

const props = defineProps<{ open: boolean; proveedor?: Proveedor | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', payload: ProveedorCreate): void
  (e: 'updated', payload: { id: number; body: ProveedorUpdate }): void
}>()

const nombre = ref('')
const telefono = ref('')
const isEditMode = computed(() => props.proveedor?.id != null)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    if (props.proveedor) {
      nombre.value = props.proveedor.nombre
      telefono.value = props.proveedor.telefono || ''
      return
    }

    nombre.value = ''
    telefono.value = ''
  },
)

const close = () => emit('close')

const submit = () => {
  if (isEditMode.value && props.proveedor?.id) {
    emit('updated', {
      id: props.proveedor.id,
      body: {
        nombre: nombre.value,
        telefono: telefono.value || null,
      },
    })
    close()
    return
  }

  emit('created', {
    nombre: nombre.value,
    telefono: telefono.value || null,
  })
  close()
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditMode ? 'Editar proveedor' : 'Crear proveedor'"
    max-width-class="max-w-lg"
    @close="close"
  >
    <form class="space-y-3" @submit.prevent="submit">
      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Building2 :size="16" />
          Nombre
        </label>
        <input
          v-model="nombre"
          required
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Phone :size="16" />
          Teléfono
        </label>
        <input
          v-model="telefono"
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
          {{ isEditMode ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped></style>
