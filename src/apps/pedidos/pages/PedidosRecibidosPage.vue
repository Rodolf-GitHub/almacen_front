<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Filter, Package, RotateCcw, Trash2 } from 'lucide-vue-next'
import {
  pedidoApiCambiarEstadoPedido,
  pedidoApiEliminarPedido,
  pedidoApiListarMisPedidosRecibidos,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import { PedidoCambiarEstadoEstado } from '../../../api/schemas'
import type { Pedido } from '../../../api/schemas'
import SearchBar from '../../../components/SearchBar.vue'
import TableLayout from '../../../components/TableLayout.vue'
import PaginationBar from '../../../components/PaginationBar.vue'

const pedidos = ref<Pedido[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100
const router = useRouter()

const loadPedidos = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await pedidoApiListarMisPedidosRecibidos(
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )
    pedidos.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los pedidos recibidos.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadPedidos()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadPedidos()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadPedidos()
}

const goToPedidoProveedores = async (pedido: Pedido) => {
  if (!pedido.id) return
  await router.push({ name: 'pedido-proveedores', params: { pedidoId: pedido.id } })
}

const toggleEstadoPedido = async (pedido: Pedido) => {
  if (!pedido.id) return

  const estadoActual =
    pedido.estado === PedidoCambiarEstadoEstado.completado
      ? PedidoCambiarEstadoEstado.completado
      : PedidoCambiarEstadoEstado.pendiente
  const estadoNuevo =
    estadoActual === PedidoCambiarEstadoEstado.completado
      ? PedidoCambiarEstadoEstado.pendiente
      : PedidoCambiarEstadoEstado.completado

  errorMessage.value = ''

  try {
    await pedidoApiCambiarEstadoPedido(pedido.id, { estado: estadoNuevo }, buildRequestOptions())
    await loadPedidos()
  } catch (error) {
    errorMessage.value = 'No se pudo cambiar el estado del pedido.'
    console.error(error)
  }
}

const handleDeletePedido = async (pedido: Pedido) => {
  if (!pedido.id) return

  if (!window.confirm(`¿Eliminar el pedido #${pedido.id}?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await pedidoApiEliminarPedido(pedido.id, buildRequestOptions())
    await loadPedidos()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar el pedido.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadPedidos()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Pedidos recibidos</h1>
        <p class="text-sm text-[var(--text-200)]">Consulta los pedidos que recibes como destino.</p>
      </div>
    </header>

    <div class="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2">
      <Filter :size="16" class="text-sky-700" />
      <p class="text-sm text-sky-800">Listado paginado de pedidos recibidos</p>
    </div>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar pedido por creador o estado..."
        :show-actions="false"
        :auto-search-delay="1000"
        @search="handleSearch"
      />
    </div>

    <TableLayout
      :headers="['Creado por', 'Creación', 'Estado', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando pedidos recibidos..."
      :empty="pedidos.length === 0"
      empty-text="Sin pedidos recibidos."
    >
      <tr
        v-for="pedido in pedidos"
        :key="pedido.id ?? `${pedido.fecha_creacion}-${pedido.creado_por}`"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          {{ pedido.creado_por_nombre || `#${pedido.creado_por}` }}
        </td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ pedido.fecha_creacion }}</td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ pedido.estado || '-' }}</td>
        <td class="px-2 py-2 sm:px-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-indigo-700 hover:bg-indigo-100"
              title="Ver proveedores"
              @click="goToPedidoProveedores(pedido)"
            >
              <Package :size="16" />
              Ver proveedores
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-emerald-700 hover:bg-emerald-100"
              :title="
                pedido.estado === PedidoCambiarEstadoEstado.completado
                  ? 'Marcar pendiente'
                  : 'Marcar completado'
              "
              @click="toggleEstadoPedido(pedido)"
            >
              <component
                :is="
                  pedido.estado === PedidoCambiarEstadoEstado.completado ? RotateCcw : CheckCircle2
                "
                :size="16"
              />
              {{
                pedido.estado === PedidoCambiarEstadoEstado.completado
                  ? 'Marcar pendiente'
                  : 'Marcar completado'
              }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-600 hover:bg-red-100"
              title="Eliminar pedido"
              @click="handleDeletePedido(pedido)"
            >
              <Trash2 :size="16" />
              Eliminar
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
  </section>
</template>

<style scoped></style>
