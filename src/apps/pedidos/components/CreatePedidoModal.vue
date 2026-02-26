<script setup lang="ts">
import { ref, watch } from 'vue'
import { PedidoCreateEstado } from '../../../api/schemas'
import type { PedidoCreate } from '../../../api/schemas'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', payload: PedidoCreate): void }>()

const usuarioDestinoId = ref<number | null>(null)
const estado = ref<PedidoCreate['estado']>(PedidoCreateEstado.pendiente)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      usuarioDestinoId.value = null
      estado.value = PedidoCreateEstado.pendiente
    }
  },
)

const close = () => emit('close')

const submit = () => {
  emit('saved', {
    usuario_destino_id: usuarioDestinoId.value,
    estado: estado.value,
  })
  close()
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-100)]/50 px-4"
  >
    <div class="w-full max-w-md rounded-lg border border-[var(--bg-300)] bg-white p-5 shadow-lg">
      <h2 class="text-lg font-semibold text-[var(--text-100)]">Crear pedido</h2>
      <form class="mt-4 space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Usuario destino (ID)</label>
          <input
            v-model.number="usuarioDestinoId"
            type="number"
            min="1"
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Estado</label>
          <select
            v-model="estado"
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          >
            <option :value="PedidoCreateEstado.pendiente">Pendiente</option>
            <option :value="PedidoCreateEstado.completado">Completado</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-md border border-[var(--bg-300)] px-4 py-2 text-sm text-[var(--text-100)]"
            @click="close"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
