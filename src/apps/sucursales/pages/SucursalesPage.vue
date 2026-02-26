<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Filter } from 'lucide-vue-next'
import { usuarioApiListarSucursales } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { Usuario } from '../../../api/schemas'
import SearchBar from '../../../components/SearchBar.vue'
import TableLayout from '../../../components/TableLayout.vue'
import PaginationBar from '../../../components/PaginationBar.vue'

const sucursales = ref<Usuario[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100

const loadSucursales = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await usuarioApiListarSucursales(
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )
    sucursales.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las sucursales.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadSucursales()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadSucursales()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadSucursales()
}

onMounted(async () => {
  await loadSucursales()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Sucursales</h1>
        <p class="text-sm text-[var(--text-200)]">Listado de sucursales asociadas a usuarios.</p>
      </div>
    </header>

    <div class="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2">
      <Filter :size="16" class="text-sky-700" />
      <p class="text-sm text-sky-800">Listado paginado de sucursales</p>
    </div>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar sucursal o encargado..."
        :show-actions="false"
        :auto-search-delay="1000"
        @search="handleSearch"
      />
    </div>

    <TableLayout
      :headers="['Sucursal', 'Encargado', 'Rol']"
      :loading="isLoading"
      loading-text="Cargando sucursales..."
      :empty="sucursales.length === 0"
      empty-text="Sin sucursales cargadas."
    >
      <tr
        v-for="sucursal in sucursales"
        :key="sucursal.id ?? `${sucursal.nombre}-${sucursal.nombre_sucursal}`"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ sucursal.nombre_sucursal || '-' }}</td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ sucursal.nombre || '-' }}</td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ sucursal.rol || '-' }}</td>
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
