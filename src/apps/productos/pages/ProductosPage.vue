<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Filter, Info, Pencil, Plus, Trash2, Image as ImageIcon } from 'lucide-vue-next'
import {
  productoApiActualizarProducto,
  productoApiCrearProducto,
  productoApiEliminarProducto,
  productoApiListarProductosPorProveedor,
  productoApiObtenerProducto,
  proveedorApiListarProveedores,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type {
  ProductoApiActualizarProductoBody,
  ProductoApiCrearProductoBody,
  ProductoDetail,
  ProductoList,
  Proveedor,
} from '../../../api/schemas'
import CreateProductoModal from '../components/CreateProductoModal.vue'
import SearchBar from '../../../components/SearchBar.vue'
import TableLayout from '../../../components/TableLayout.vue'
import BaseModal from '../../../components/BaseModal.vue'
import PaginationBar from '../../../components/PaginationBar.vue'

const openCreateModal = ref(false)
const productos = ref<ProductoList[]>([])
const proveedores = ref<Proveedor[]>([])
const selectedProducto = ref<ProductoDetail | null>(null)
const infoProducto = ref<ProductoDetail | null>(null)
const openInfoModal = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const proveedorFiltroId = ref<number | null>(null)
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100

const sanitizarProveedores = (items: unknown[]): Proveedor[] => {
  return items.filter((item): item is Proveedor => {
    if (!item || typeof item !== 'object') return false
    return 'id' in item && (item as Proveedor).id != null && 'nombre' in item
  })
}

const resolveImageUrl = (image?: string | null) => {
  if (!image) return null
  if (image.startsWith('http://') || image.startsWith('https://')) return image

  const cleanPath = image.startsWith('/') ? image : `/${image}`
  const backendBaseUrl =
    (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    'http://127.0.0.1:8000'

  if (backendBaseUrl) {
    return new URL(cleanPath, backendBaseUrl).toString()
  }

  return new URL(cleanPath, window.location.origin).toString()
}

const loadProveedores = async () => {
  try {
    const response = await proveedorApiListarProveedores(undefined, buildRequestOptions())
    proveedores.value = sanitizarProveedores(response.data.items ?? [])

    if (!proveedorFiltroId.value) {
      proveedorFiltroId.value =
        proveedores.value.find((proveedor) => proveedor.id != null)?.id ?? null
    }
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los proveedores.'
    console.error(error)
  }
}

const loadProductos = async () => {
  if (!proveedorFiltroId.value) {
    productos.value = []
    totalItems.value = 0
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await productoApiListarProductosPorProveedor(
      proveedorFiltroId.value,
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )
    productos.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los productos.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  selectedProducto.value = null
  openCreateModal.value = true
}

const handleProviderChange = async () => {
  currentPage.value = 1
  await loadProductos()
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadProductos()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadProductos()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadProductos()
}

const openEdit = async (producto: ProductoList) => {
  if (!producto.id) {
    return
  }

  errorMessage.value = ''

  try {
    const response = await productoApiObtenerProducto(producto.id, buildRequestOptions())
    selectedProducto.value = response.data
    openCreateModal.value = true
  } catch (error) {
    errorMessage.value = 'No se pudo cargar el detalle del producto para editar.'
    console.error(error)
  }
}

const openInfo = async (producto: ProductoList) => {
  if (!producto.id) return

  errorMessage.value = ''

  try {
    const response = await productoApiObtenerProducto(producto.id, buildRequestOptions())
    infoProducto.value = response.data
    openInfoModal.value = true
  } catch (error) {
    errorMessage.value = 'No se pudo cargar la información del producto.'
    console.error(error)
  }
}

const handleDelete = async (producto: ProductoList) => {
  if (!producto.id) {
    return
  }

  if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await productoApiEliminarProducto(producto.id, buildRequestOptions())
    await loadProductos()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar el producto.'
    console.error(error)
  }
}

const handleCreated = async (payload: ProductoApiCrearProductoBody) => {
  errorMessage.value = ''

  try {
    await productoApiCrearProducto(payload, buildRequestOptions())
    selectedProducto.value = null
    openCreateModal.value = false
    await loadProductos()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el producto.'
    console.error(error)
  }
}

const handleUpdated = async (payload: { id: number; body: ProductoApiActualizarProductoBody }) => {
  errorMessage.value = ''

  try {
    await productoApiActualizarProducto(payload.id, payload.body, buildRequestOptions())
    selectedProducto.value = null
    openCreateModal.value = false
    await loadProductos()
  } catch (error) {
    errorMessage.value = 'No se pudo actualizar el producto.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadProveedores()
  await loadProductos()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Productos</h1>
        <p class="text-sm text-[var(--text-200)]">Administra catálogo, precio y stock.</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-medium text-white"
        @click="openCreate"
      >
        <Plus :size="16" />
        Crear producto
      </button>
    </header>

    <div class="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2">
      <Filter :size="16" class="text-sky-700" />
      <select
        v-model.number="proveedorFiltroId"
        @change="handleProviderChange"
        class="w-52 rounded-md border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
      >
        <option :value="null" disabled>Proveedor</option>
        <option
          v-for="proveedor in proveedores"
          :key="proveedor.id ?? proveedor.nombre"
          :value="proveedor.id"
        >
          {{ proveedor.nombre }}
        </option>
      </select>
    </div>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar producto por nombre..."
        :show-actions="false"
        :auto-search-delay="1000"
        @search="handleSearch"
      />
    </div>

    <TableLayout
      :headers="['Nombre', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando productos..."
      :empty="productos.length === 0"
      empty-text="Sin productos cargados."
    >
      <tr
        v-for="producto in productos"
        :key="producto.id ?? producto.nombre"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="w-[75%] px-2 py-2 sm:px-3">
          <div class="flex items-center gap-2">
            <img
              v-if="resolveImageUrl(producto.imagen)"
              :src="resolveImageUrl(producto.imagen) || ''"
              :alt="producto.nombre"
              class="h-11 w-11 shrink-0 rounded-md border border-sky-200 object-cover"
            />
            <div
              v-else
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-sky-200 bg-white"
            >
              <ImageIcon :size="16" class="text-sky-400" />
            </div>
            <p class="truncate text-sm font-semibold text-sky-900 sm:text-base">
              {{ producto.nombre }}
            </p>
          </div>
        </td>
        <td class="w-[25%] px-2 py-2 sm:px-3">
          <div class="flex items-center justify-start gap-1 sm:gap-1.5">
            <button
              type="button"
              class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
              title="Información"
              @click="openInfo(producto)"
            >
              <Info :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
              title="Editar"
              @click="openEdit(producto)"
            >
              <Pencil :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
              title="Eliminar"
              @click="handleDelete(producto)"
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

    <CreateProductoModal
      :open="openCreateModal"
      :proveedores="proveedores"
      :producto="selectedProducto"
      @close="openCreateModal = false"
      @created="handleCreated"
      @updated="handleUpdated"
    />

    <BaseModal
      :open="openInfoModal"
      title="Detalle del producto"
      max-width-class="max-w-md"
      @close="openInfoModal = false"
    >
      <div v-if="infoProducto" class="space-y-3 text-sm text-sky-900">
        <div class="flex items-center gap-3 rounded-md border border-sky-100 bg-sky-50 p-2">
          <img
            v-if="resolveImageUrl(infoProducto.imagen)"
            :src="resolveImageUrl(infoProducto.imagen) || ''"
            :alt="infoProducto.nombre"
            class="h-14 w-14 rounded-md border border-sky-200 object-cover"
          />
          <div
            v-else
            class="flex h-14 w-14 items-center justify-center rounded-md border border-sky-200 bg-white"
          >
            <ImageIcon :size="18" class="text-sky-400" />
          </div>
          <div>
            <p class="font-semibold">{{ infoProducto.nombre }}</p>
            <p class="text-xs text-sky-700">ID: {{ infoProducto.id || '-' }}</p>
          </div>
        </div>

        <p>
          <span class="font-medium text-sky-700">Proveedor:</span>
          {{ infoProducto.proveedor_nombre || `#${infoProducto.proveedor}` }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Descripción:</span>
          {{ infoProducto.descripcion || '-' }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Precio compra:</span>
          {{ infoProducto.precio_compra || '-' }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Precio venta:</span>
          {{ infoProducto.precio_venta || '-' }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Creación:</span> {{ infoProducto.fecha_creacion }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Actualización:</span>
          {{ infoProducto.fecha_actualizacion }}
        </p>
      </div>
    </BaseModal>
  </section>
</template>

<style scoped></style>
