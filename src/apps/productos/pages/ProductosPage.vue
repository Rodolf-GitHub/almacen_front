<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Apple, Filter, Info, Pencil, Trash2, Image as ImageIcon } from 'lucide-vue-next'
import {
  productoApiActualizarProducto,
  productoApiCrearProducto,
  productoApiEliminarProducto,
  productoApiListarProductosPorProveedor,
  productoApiListarProductosTodos,
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
import BaseModal from '../../../components/BaseModal.vue'
import CreateButton from '../../../components/CreateButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import SearchBar from '../../../components/SearchBar.vue'
import TitleCard from '../../../components/TitleCard.vue'

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
const route = useRoute()

const parseProveedorQueryId = (value: unknown): number | null => {
  if (typeof value !== 'string') return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const applyProveedorFromQuery = () => {
  const proveedorIdFromQuery = parseProveedorQueryId(route.query.proveedor)
  proveedorFiltroId.value = proveedorIdFromQuery
}

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
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los proveedores.'
    console.error(error)
  }
}

const loadProductos = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const params = {
      busqueda: busqueda.value || undefined,
      limit: pageSize,
      offset: (currentPage.value - 1) * pageSize,
    }

    const response = proveedorFiltroId.value
      ? await productoApiListarProductosPorProveedor(
          proveedorFiltroId.value,
          params,
          buildRequestOptions(),
        )
      : await productoApiListarProductosTodos(params, buildRequestOptions())

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

const formatCurrency = (value?: string | null) => {
  if (!value) return '—'

  const parsed = Number(value)
  if (Number.isNaN(parsed)) return value

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(parsed)
}

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-AR')
}

const formatHora = (fecha?: string | null) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const formatFechaHora = (fecha?: string | null) => {
  if (!fecha) return '—'
  return `${formatFecha(fecha)} • ${formatHora(fecha)}`
}

onMounted(async () => {
  applyProveedorFromQuery()
  await loadProveedores()
  await loadProductos()
})

watch(
  () => route.query.proveedor,
  async () => {
    const previousProveedorId = proveedorFiltroId.value
    applyProveedorFromQuery()

    if (proveedorFiltroId.value !== previousProveedorId) {
      currentPage.value = 1
      await loadProductos()
    }
  },
)
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-3">
      <TitleCard title="Productos" description="Gestiona los productos disponibles" />
      <CreateButton label="Crear producto" @click="openCreate" />
    </header>

    <div
      class="w-full rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4"
    >
      <div class="mb-2 flex items-center gap-2 text-sky-800">
        <Filter :size="20" class="text-sky-700" />
        <p class="text-sm font-semibold">Filtrar por proveedor</p>
      </div>
      <select
        v-model.number="proveedorFiltroId"
        @change="handleProviderChange"
        class="h-12 w-full rounded-lg border-2 border-sky-300 bg-white px-4 text-base font-medium text-sky-900 outline-none focus:border-sky-500"
      >
        <option :value="null">Todos los proveedores</option>
        <option
          v-for="proveedor in proveedores"
          :key="proveedor.id ?? proveedor.nombre"
          :value="proveedor.id"
        >
          {{ proveedor.nombre }}
        </option>
      </select>
    </div>

    <SearchBar
      v-model="busqueda"
      class="w-full"
      placeholder="Buscar productos..."
      :show-actions="false"
      :auto-search-delay="500"
      @search="handleSearch"
      @clear="handleSearch"
    />

    <div v-if="isLoading && productos.length === 0" class="py-12 text-center">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-100)] border-r-transparent"
      ></div>
      <p class="mt-2 text-sm text-[var(--text-200)]">Cargando productos...</p>
    </div>

    <div
      v-else-if="!isLoading && productos.length === 0"
      class="rounded-lg border border-[var(--bg-300)] bg-white py-12 text-center"
    >
      <Apple :size="48" class="mx-auto mb-4 text-[var(--text-200)]" :stroke-width="1.5" />
      <h3 class="mb-2 text-lg font-medium text-[var(--text-100)]">No hay productos registrados</h3>
      <p class="mb-4 text-sm text-[var(--text-200)]">Comienza creando tu primer producto</p>
      <div class="flex justify-center">
        <CreateButton label="Crear producto" :mobile-full="false" @click="openCreate" />
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="producto in productos"
        :key="producto.id ?? producto.nombre"
        class="group rounded-lg border border-blue-100 bg-blue-50/50 p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
      >
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--bg-300)] bg-gradient-to-br from-[var(--bg-200)] to-[var(--bg-100)]"
              >
                <img
                  v-if="resolveImageUrl(producto.imagen)"
                  :src="resolveImageUrl(producto.imagen) || ''"
                  :alt="producto.nombre"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-[var(--text-200)]"
                >
                  <ImageIcon :size="20" :stroke-width="1.5" />
                </div>
              </div>

              <div class="min-w-0">
                <h3 class="line-clamp-1 font-semibold text-[var(--text-100)]">
                  {{ producto.nombre }}
                </h3>
                <p class="text-xs text-[var(--text-200)]">
                  Proveedor: {{ producto.proveedor_nombre || `#${producto.proveedor}` }}
                </p>
                <p class="text-xs text-[var(--text-200)]">
                  Actualizado: {{ formatFechaHora(producto.fecha_actualizacion) }}
                </p>
              </div>
            </div>

            <div class="flex flex-shrink-0 gap-2">
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
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Compra: {{ formatCurrency(producto.precio_compra) }}
            </span>
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              Venta: {{ formatCurrency(producto.precio_venta) }}
            </span>
          </div>
        </div>
      </div>
    </div>

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
          <span class="font-medium text-sky-700">Creación:</span>
          {{ formatFechaHora(infoProducto.fecha_creacion) }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Actualización:</span>
          {{ formatFechaHora(infoProducto.fecha_actualizacion) }}
        </p>
      </div>
    </BaseModal>
  </section>
</template>

<style scoped></style>
