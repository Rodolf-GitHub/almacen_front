<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, ChevronRight, Package } from 'lucide-vue-next'
import { pedidoApiListarProveedoresResumenPorPedido } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { PedidoProveedorResumen } from '../../../api/schemas'

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

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="proveedor in proveedores"
        :key="`${proveedor.proveedor_id}-${proveedor.proveedor_nombre}`"
        type="button"
        class="group rounded-xl border border-sky-200 bg-white p-4 text-left shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50"
        @click="goToProveedorProductos(proveedor)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700"
            >
              <Building2 :size="18" />
            </span>
            <div>
              <p class="font-semibold text-sky-900">{{ proveedor.proveedor_nombre }}</p>
              <p class="mt-1 inline-flex items-center gap-1 text-sm text-sky-700">
                <Package :size="14" />
                {{ proveedor.cantidad_productos_pedidos }} productos pedidos
              </p>
            </div>
          </div>
          <ChevronRight
            :size="16"
            class="text-sky-500 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped></style>
