<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Info, MessageCircle, Package, Pencil, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import {
  proveedorApiActualizarProveedor,
  proveedorApiCrearProveedor,
  proveedorApiEliminarProveedor,
  proveedorApiListarProveedores,
  proveedorApiObtenerProveedor,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { Proveedor, ProveedorCreate, ProveedorUpdate } from '../../../api/schemas'
import CreateProveedorModal from '../components/CreateProveedorModal.vue'
import SearchBar from '../../../components/SearchBar.vue'
import TableLayout from '../../../components/TableLayout.vue'
import BaseModal from '../../../components/BaseModal.vue'
import CreateButton from '../../../components/CreateButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import TitleCard from '../../../components/TitleCard.vue'

const openCreateModal = ref(false)
const proveedores = ref<Proveedor[]>([])
const selectedProveedor = ref<Proveedor | null>(null)
const infoProveedor = ref<Proveedor | null>(null)
const openInfoModal = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100
const router = useRouter()

const normalizePhone = (telefono?: string | null) => {
  if (!telefono) return ''
  return telefono.replace(/\D/g, '')
}

const getWhatsappLink = (telefono?: string | null) => {
  const normalized = normalizePhone(telefono)
  if (!normalized) return null
  return `https://wa.me/${normalized}`
}

const goToProveedorProductos = async (proveedor: Proveedor) => {
  if (!proveedor.id) return

  await router.push({
    name: 'productos',
    query: { proveedor: String(proveedor.id) },
  })
}

const loadProveedores = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await proveedorApiListarProveedores(
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )
    proveedores.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los proveedores.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  selectedProveedor.value = null
  openCreateModal.value = true
}

const openEdit = async (proveedor: Proveedor) => {
  if (!proveedor.id) return

  errorMessage.value = ''

  try {
    const response = await proveedorApiObtenerProveedor(proveedor.id, buildRequestOptions())
    selectedProveedor.value = response.data
    openCreateModal.value = true
  } catch (error) {
    errorMessage.value = 'No se pudo cargar el detalle del proveedor para editar.'
    console.error(error)
  }
}

const openInfo = async (proveedor: Proveedor) => {
  if (!proveedor.id) return

  errorMessage.value = ''

  try {
    const response = await proveedorApiObtenerProveedor(proveedor.id, buildRequestOptions())
    infoProveedor.value = response.data
    openInfoModal.value = true
  } catch (error) {
    errorMessage.value = 'No se pudo cargar la información del proveedor.'
    console.error(error)
  }
}

const handleDelete = async (proveedor: Proveedor) => {
  if (!proveedor.id) return

  if (!window.confirm(`¿Eliminar el proveedor "${proveedor.nombre}"?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await proveedorApiEliminarProveedor(proveedor.id, buildRequestOptions())
    await loadProveedores()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar el proveedor.'
    console.error(error)
  }
}

const handleCreated = async (payload: ProveedorCreate) => {
  errorMessage.value = ''

  try {
    await proveedorApiCrearProveedor(payload, buildRequestOptions())
    selectedProveedor.value = null
    openCreateModal.value = false
    await loadProveedores()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el proveedor.'
    console.error(error)
  }
}

const handleUpdated = async (payload: { id: number; body: ProveedorUpdate }) => {
  errorMessage.value = ''

  try {
    await proveedorApiActualizarProveedor(payload.id, payload.body, buildRequestOptions())
    selectedProveedor.value = null
    openCreateModal.value = false
    await loadProveedores()
  } catch (error) {
    errorMessage.value = 'No se pudo actualizar el proveedor.'
    console.error(error)
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadProveedores()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadProveedores()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadProveedores()
}

onMounted(async () => {
  await loadProveedores()
})
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-3">
      <TitleCard title="Proveedores" description="Controla los proveedores del almacén." />
      <CreateButton label="Crear proveedor" @click="openCreate" />
    </header>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar proveedor por nombre..."
        :show-actions="false"
        :auto-search-delay="1000"
        @search="handleSearch"
      />
    </div>

    <TableLayout
      :headers="['Nombre', 'Teléfono', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando proveedores..."
      :empty="proveedores.length === 0"
      empty-text="Sin proveedores cargados."
    >
      <tr
        v-for="proveedor in proveedores"
        :key="proveedor.id ?? proveedor.nombre"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 font-medium text-sky-900 sm:px-3">{{ proveedor.nombre }}</td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          <div class="flex items-center gap-2">
            <span>{{ proveedor.telefono || '-' }}</span>
            <a
              v-if="getWhatsappLink(proveedor.telefono)"
              :href="getWhatsappLink(proveedor.telefono) || '#'"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center rounded-md border border-green-200 bg-green-50 p-1.5 hover:bg-green-100"
              title="Abrir WhatsApp"
            >
              <MessageCircle :size="16" class="text-green-600" />
            </a>
          </div>
        </td>
        <td class="px-2 py-2 sm:px-3">
          <div class="flex flex-wrap items-center justify-start gap-1.5">
            <button
              type="button"
              class="rounded-md border border-indigo-200 bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
              title="Ver productos"
              @click="goToProveedorProductos(proveedor)"
            >
              <Package :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
              title="Información"
              @click="openInfo(proveedor)"
            >
              <Info :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
              title="Editar"
              @click="openEdit(proveedor)"
            >
              <Pencil :size="16" />
            </button>
            <button
              type="button"
              class="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
              title="Eliminar"
              @click="handleDelete(proveedor)"
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

    <CreateProveedorModal
      :open="openCreateModal"
      :proveedor="selectedProveedor"
      @close="openCreateModal = false"
      @created="handleCreated"
      @updated="handleUpdated"
    />

    <BaseModal
      :open="openInfoModal"
      title="Detalle del proveedor"
      max-width-class="max-w-md"
      @close="openInfoModal = false"
    >
      <div v-if="infoProveedor" class="space-y-3 text-sm text-sky-900">
        <p><span class="font-medium text-sky-700">ID:</span> {{ infoProveedor.id || '-' }}</p>
        <p><span class="font-medium text-sky-700">Nombre:</span> {{ infoProveedor.nombre }}</p>
        <p>
          <span class="font-medium text-sky-700">Teléfono:</span>
          {{ infoProveedor.telefono || '-' }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Creado por:</span>
          {{ infoProveedor.creado_por || '-' }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Creación:</span> {{ infoProveedor.fecha_creacion }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Actualización:</span>
          {{ infoProveedor.fecha_actualizacion }}
        </p>
      </div>
    </BaseModal>
  </section>
</template>

<style scoped></style>
