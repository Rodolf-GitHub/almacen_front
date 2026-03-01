<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, Package } from 'lucide-vue-next'
import { pedidoApiListarProveedoresResumenPorPedido } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { PedidoProveedorResumen } from '../../../api/schemas'
import TableLayout from '../../../components/TableLayout.vue'

const route = useRoute()
const router = useRouter()

const proveedores = ref<PedidoProveedorResumen[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const pedidoId = Number.parseInt(route.params.pedidoId as string, 10)

const loadProveedoresResumen = async () => {
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    errorMessage.value = 'Pedido inválido.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await pedidoApiListarProveedoresResumenPorPedido(
      pedidoId,
      buildRequestOptions(),
    )
    proveedores.value = response.data ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los proveedores del pedido.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const goToProveedorProductos = async (proveedor: PedidoProveedorResumen) => {
  await router.push({
    name: 'pedido-proveedor-productos',
    params: {
      pedidoId,
      proveedorId: proveedor.proveedor_id,
    },
    query: { proveedorNombre: proveedor.proveedor_nombre },
  })
}

onMounted(async () => {
  await loadProveedoresResumen()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Proveedores del pedido</h1>
        <p class="text-sm text-[var(--text-200)]">Pedido #{{ pedidoId }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
        @click="router.back()"
      >
        <ArrowLeft :size="16" />
        Volver
      </button>
    </header>

    <div
      v-if="isLoading"
      class="rounded-lg border border-sky-200 bg-white p-4 text-sm text-sky-800"
    >
      Cargando proveedores...
    </div>

    <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <div
      v-else-if="proveedores.length === 0"
      class="rounded-lg border border-sky-200 bg-white p-4 text-sm text-sky-800"
    >
      Este pedido no tiene proveedores asociados.
    </div>

    <TableLayout
      v-else
      :headers="['Proveedor', 'Productos pedidos', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando proveedores..."
      :empty="proveedores.length === 0"
      empty-text="Este pedido no tiene proveedores asociados."
    >
      <tr
        v-for="proveedor in proveedores"
        :key="`${proveedor.proveedor_id}-${proveedor.proveedor_nombre}`"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700"
            >
              <Building2 :size="16" />
            </span>
            <span class="font-semibold">{{ proveedor.proveedor_nombre }}</span>
          </div>
        </td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ proveedor.cantidad_productos_pedidos }}</td>
        <td class="px-2 py-2 sm:px-3">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-indigo-700 hover:bg-indigo-100"
            title="Ver productos"
            @click="goToProveedorProductos(proveedor)"
          >
            <Package :size="16" />
            Ver productos
          </button>
        </td>
      </tr>
    </TableLayout>
  </section>
</template>

<style scoped></style>
