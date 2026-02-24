<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { productoApiCreateProducto, productoApiListProductos } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { ProductoApiCreateProductoBody, ProductoSchema } from '../../../api/schemas'
import CreateProductoModal from '../components/CreateProductoModal.vue'

const openCreateModal = ref(false)
const productos = ref<ProductoSchema[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadProductos = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await productoApiListProductos(undefined, buildRequestOptions())
    productos.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los productos.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: ProductoApiCreateProductoBody) => {
  errorMessage.value = ''

  try {
    await productoApiCreateProducto(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadProductos()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el producto.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadProductos()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Productos</h1>
        <p class="text-sm text-[var(--text-200)]">Administra catálogo, precio y stock.</p>
      </div>
      <button
        class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
        @click="openCreateModal = true"
      >
        Crear producto
      </button>
    </header>

    <div class="overflow-hidden rounded-lg border border-[var(--bg-300)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[var(--bg-200)] text-[var(--text-200)]">
          <tr>
            <th class="px-4 py-3 font-medium">Producto</th>
            <th class="px-4 py-3 font-medium">Precio</th>
            <th class="px-4 py-3 font-medium">Proveedor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="3">Cargando productos...</td>
          </tr>
          <tr v-else-if="productos.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="3">Sin productos cargados.</td>
          </tr>
          <tr v-for="producto in productos" :key="producto.id ?? producto.nombre">
            <td class="px-4 py-3 text-[var(--text-100)]">{{ producto.nombre }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ producto.precio }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">#{{ producto.proveedor }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreateProductoModal
      :open="openCreateModal"
      @close="openCreateModal = false"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped></style>
