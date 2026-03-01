<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import {
  productoApiCategoriasActualizarCategoriaProducto,
  productoApiCategoriasCrearCategoriaProducto,
  productoApiCategoriasEliminarCategoriaProducto,
  productoApiCategoriasListarCategoriasProducto,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type {
  CategoriaProductoCreate,
  CategoriaProductoSchema,
  CategoriaProductoUpdate,
} from '../../../api/schemas'
import CreateButton from '../../../components/CreateButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import SearchBar from '../../../components/SearchBar.vue'
import TableLayout from '../../../components/TableLayout.vue'
import TitleCard from '../../../components/TitleCard.vue'
import CreateCategoriaProductoModal from '../components/CreateCategoriaProductoModal.vue'

const categorias = ref<CategoriaProductoSchema[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100

const openCategoriaModal = ref(false)
const selectedCategoria = ref<CategoriaProductoSchema | null>(null)

const loadCategorias = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await productoApiCategoriasListarCategoriasProducto(
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )

    categorias.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las categorías de productos.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadCategorias()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadCategorias()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadCategorias()
}

const openEdit = (categoria: CategoriaProductoSchema) => {
  selectedCategoria.value = categoria
  openCategoriaModal.value = true
}

const openCreate = () => {
  selectedCategoria.value = null
  openCategoriaModal.value = true
}

const handleCreate = async (payload: CategoriaProductoCreate) => {
  errorMessage.value = ''

  try {
    await productoApiCategoriasCrearCategoriaProducto(payload, buildRequestOptions())
    openCategoriaModal.value = false
    await loadCategorias()
  } catch (error) {
    errorMessage.value = 'No se pudo crear la categoría.'
    console.error(error)
  }
}

const handleUpdate = async (payload: { id: number; body: CategoriaProductoUpdate }) => {
  if (!payload.id) return

  errorMessage.value = ''

  try {
    await productoApiCategoriasActualizarCategoriaProducto(
      payload.id,
      payload.body,
      buildRequestOptions(),
    )
    openCategoriaModal.value = false
    selectedCategoria.value = null
    await loadCategorias()
  } catch (error) {
    errorMessage.value = 'No se pudo actualizar la categoría.'
    console.error(error)
  }
}

const handleDelete = async (categoria: CategoriaProductoSchema) => {
  if (!categoria.id) return

  if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await productoApiCategoriasEliminarCategoriaProducto(categoria.id, buildRequestOptions())
    await loadCategorias()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar la categoría.'
    console.error(error)
  }
}

const formatFechaHora = (fecha?: string | null) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return fecha

  return `${date.toLocaleDateString('es-AR')} ${date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

onMounted(async () => {
  await loadCategorias()
})
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-3">
      <TitleCard
        title="Categorías de productos"
        description="Gestiona las categorías disponibles para clasificar productos."
      />
      <CreateButton label="Crear categoría" @click="openCreate" />
    </header>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar categoría por nombre..."
        :show-actions="false"
        :auto-search-delay="600"
        @search="handleSearch"
      />
    </div>

    <TableLayout
      :headers="['Nombre', 'Creación', 'Actualización', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando categorías..."
      :empty="categorias.length === 0"
      empty-text="No hay categorías cargadas."
    >
      <tr
        v-for="categoria in categorias"
        :key="categoria.id ?? categoria.nombre"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 font-medium text-sky-900 sm:px-3">{{ categoria.nombre }}</td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          {{ formatFechaHora(categoria.fecha_creacion) }}
        </td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          {{ formatFechaHora(categoria.fecha_actualizacion) }}
        </td>
        <td class="px-2 py-2 sm:px-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
              title="Editar"
              @click="openEdit(categoria)"
            >
              <Pencil :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
              title="Eliminar"
              @click="handleDelete(categoria)"
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

    <CreateCategoriaProductoModal
      :open="openCategoriaModal"
      :categoria="selectedCategoria"
      @close="openCategoriaModal = false"
      @created="handleCreate"
      @updated="handleUpdate"
    />
  </section>
</template>

<style scoped></style>
