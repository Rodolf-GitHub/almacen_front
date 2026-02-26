<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { pedidoApiCrearPedido, pedidoApiListarPedidos } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { Pedido, PedidoCreate } from '../../../api/schemas'
import CreatePedidoModal from '../components/CreatePedidoModal.vue'

const openCreateModal = ref(false)
const pedidos = ref<Pedido[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadPedidos = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await pedidoApiListarPedidos(undefined, buildRequestOptions())
    pedidos.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los pedidos.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: PedidoCreate) => {
  errorMessage.value = ''

  try {
    await pedidoApiCrearPedido(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadPedidos()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el pedido.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadPedidos()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Pedidos</h1>
        <p class="text-sm text-[var(--text-200)]">Gestiona las órdenes del almacén.</p>
      </div>
      <button
        class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
        @click="openCreateModal = true"
      >
        Crear pedido
      </button>
    </header>

    <div class="overflow-hidden rounded-lg border border-[var(--bg-300)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[var(--bg-200)] text-[var(--text-200)]">
          <tr>
            <th class="px-4 py-3 font-medium">Creado por</th>
            <th class="px-4 py-3 font-medium">Destino</th>
            <th class="px-4 py-3 font-medium">Creación</th>
            <th class="px-4 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="4">Cargando pedidos...</td>
          </tr>
          <tr v-else-if="pedidos.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="4">Sin pedidos cargados.</td>
          </tr>
          <tr
            v-for="pedido in pedidos"
            :key="pedido.id ?? `${pedido.fecha_creacion}-${pedido.creado_por}`"
          >
            <td class="px-4 py-3 text-[var(--text-100)]">
              {{ pedido.creado_por_nombre || `#${pedido.creado_por}` }}
            </td>
            <td class="px-4 py-3 text-[var(--text-100)]">
              {{
                pedido.usuario_destino_nombre ||
                (pedido.usuario_destino ? `#${pedido.usuario_destino}` : '-')
              }}
            </td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ pedido.fecha_creacion }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ pedido.estado || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreatePedidoModal
      :open="openCreateModal"
      @close="openCreateModal = false"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped></style>
