<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import {
  pedidoApiActualizarProductoPedido,
  pedidoApiCrearProductoPedido,
  pedidoApiEliminarProductoPedido,
  pedidoApiListarProductosPedidoPorProveedor,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { PedidoDetalle, PedidoDetalleCreate, PedidoDetalleUpdate } from '../../../api/schemas'
import PaginationBar from '../../../components/PaginationBar.vue'
import SearchBar from '../../../components/SearchBar.vue'
import TableLayout from '../../../components/TableLayout.vue'
import PedidoDetalleModal from '../components/PedidoDetalleModal.vue'

const route = useRoute()
const router = useRouter()

const pedidoId = Number.parseInt(route.params.pedidoId as string, 10)
const proveedorId = Number.parseInt(route.params.proveedorId as string, 10)
const proveedorNombre = computed(
  () => (route.query.proveedorNombre as string | undefined) || `Proveedor #${proveedorId}`,
)

const detalles = ref<PedidoDetalle[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100

const openDetalleModal = ref(false)
const selectedDetalle = ref<PedidoDetalle | null>(null)

const loadDetalles = async () => {
  if (
    !Number.isFinite(pedidoId) ||
    pedidoId <= 0 ||
    !Number.isFinite(proveedorId) ||
    proveedorId <= 0
  ) {
    errorMessage.value = 'Pedido o proveedor inválido.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await pedidoApiListarProductosPedidoPorProveedor(
      pedidoId,
      proveedorId,
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )
    detalles.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los productos del pedido.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  selectedDetalle.value = null
  openDetalleModal.value = true
}

const openEdit = (detalle: PedidoDetalle) => {
  selectedDetalle.value = detalle
  openDetalleModal.value = true
}

const handleDelete = async (detalle: PedidoDetalle) => {
  if (!detalle.id) return

  if (
    !window.confirm(`¿Eliminar "${detalle.producto_nombre || `#${detalle.producto}`}" del pedido?`)
  ) {
    return
  }

  errorMessage.value = ''

  try {
    await pedidoApiEliminarProductoPedido(detalle.id, buildRequestOptions())
    await loadDetalles()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar el producto del pedido.'
    console.error(error)
  }
}

const handleCreated = async (payload: PedidoDetalleCreate) => {
  errorMessage.value = ''

  try {
    await pedidoApiCrearProductoPedido(payload, buildRequestOptions())
    openDetalleModal.value = false
    selectedDetalle.value = null
    await loadDetalles()
  } catch (error) {
    errorMessage.value = 'No se pudo agregar el producto al pedido.'
    console.error(error)
  }
}

const handleUpdated = async (payload: { id: number; body: PedidoDetalleUpdate }) => {
  errorMessage.value = ''

  try {
    await pedidoApiActualizarProductoPedido(payload.id, payload.body, buildRequestOptions())
    openDetalleModal.value = false
    selectedDetalle.value = null
    await loadDetalles()
  } catch (error) {
    errorMessage.value = 'No se pudo actualizar el producto del pedido.'
    console.error(error)
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadDetalles()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadDetalles()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadDetalles()
}

onMounted(async () => {
  await loadDetalles()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Productos del pedido</h1>
        <p class="text-sm text-[var(--text-200)]">Pedido #{{ pedidoId }} · {{ proveedorNombre }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
          @click="router.back()"
        >
          <ArrowLeft :size="16" />
          Volver
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-medium text-white"
          @click="openCreate"
        >
          <Plus :size="16" />
          Agregar producto
        </button>
      </div>
    </header>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar producto del pedido..."
        :show-actions="false"
        :auto-search-delay="1000"
        @search="handleSearch"
      />
    </div>

    <TableLayout
      :headers="['Producto', 'Cantidad', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando productos del pedido..."
      :empty="detalles.length === 0"
      empty-text="Sin productos registrados para este proveedor en el pedido."
    >
      <tr
        v-for="detalle in detalles"
        :key="detalle.id ?? `${detalle.producto}-${detalle.fecha_creacion}`"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          {{ detalle.producto_nombre || `#${detalle.producto}` }}
        </td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ detalle.cantidad }}</td>
        <td class="px-2 py-2 sm:px-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
              title="Editar"
              @click="openEdit(detalle)"
            >
              <Pencil :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
              title="Eliminar"
              @click="handleDelete(detalle)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </td>
      </tr>
    </TableLayout>

    <PaginationBar
      :current-page="currentPage"
      :total-items="totalItems"
      :page-size="pageSize"
      :disabled="isLoading"
      @previous="goPreviousPage"
      @next="goNextPage"
    />

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <PedidoDetalleModal
      :open="openDetalleModal"
      :pedido-id="pedidoId"
      :proveedor-id="proveedorId"
      :detalle="selectedDetalle"
      @close="openDetalleModal = false"
      @created="handleCreated"
      @updated="handleUpdated"
    />
  </section>
</template>

<style scoped></style>
