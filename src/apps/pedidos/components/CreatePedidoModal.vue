<script setup lang="ts">
import { ref, watch } from 'vue'
import { Building2, CircleCheck } from 'lucide-vue-next'
import { usuarioApiListarSucursales } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import { PedidoCreateEstado } from '../../../api/schemas'
import type { PedidoCreate, Usuario } from '../../../api/schemas'
import BaseModal from '../../../components/BaseModal.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', payload: PedidoCreate): void }>()

const usuarioDestinoId = ref<number | null>(null)
const estado = ref<PedidoCreate['estado']>(PedidoCreateEstado.pendiente)
const sucursales = ref<Usuario[]>([])
const isLoadingSucursales = ref(false)
const errorMessage = ref('')

const loadSucursales = async () => {
  isLoadingSucursales.value = true
  errorMessage.value = ''

  try {
    const response = await usuarioApiListarSucursales(
      { limit: 1000, offset: 0 },
      buildRequestOptions(),
    )
    sucursales.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las sucursales destino.'
    console.error(error)
  } finally {
    isLoadingSucursales.value = false
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      usuarioDestinoId.value = null
      estado.value = PedidoCreateEstado.pendiente
      await loadSucursales()
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
  <BaseModal :open="open" title="Crear pedido" max-width-class="max-w-lg" @close="close">
    <form class="space-y-3" @submit.prevent="submit">
      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Building2 :size="16" />
          Sucursal destino
          <span class="text-xs text-sky-500">(no obligatorio)</span>
        </label>
        <select
          v-model.number="usuarioDestinoId"
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        >
          <option :value="null">Sin destino específico</option>
          <option v-if="isLoadingSucursales" :value="null" disabled>Cargando sucursales...</option>
          <option
            v-for="sucursal in sucursales"
            :key="sucursal.id ?? `${sucursal.nombre}-${sucursal.nombre_sucursal}`"
            :value="sucursal.id"
          >
            {{ sucursal.nombre_sucursal }} - {{ sucursal.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <CircleCheck :size="16" />
          Estado
          <span class="text-xs text-sky-500">(no obligatorio)</span>
        </label>
        <select
          v-model="estado"
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        >
          <option :value="PedidoCreateEstado.pendiente">Pendiente</option>
          <option :value="PedidoCreateEstado.completado">Completado</option>
        </select>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

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
          Guardar
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped></style>
