<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { sucursalApiCreateSucursal, sucursalApiListSucursales } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { SucursalCreateSchema, SucursalSchema } from '../../../api/schemas'
import CreateSucursalModal from '../components/CreateSucursalModal.vue'

const openCreateModal = ref(false)
const sucursales = ref<SucursalSchema[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadSucursales = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await sucursalApiListSucursales(undefined, buildRequestOptions())
    sucursales.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las sucursales.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: SucursalCreateSchema) => {
  errorMessage.value = ''

  try {
    await sucursalApiCreateSucursal(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadSucursales()
  } catch (error) {
    errorMessage.value = 'No se pudo crear la sucursal.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadSucursales()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Sucursales</h1>
        <p class="text-sm text-[var(--text-200)]">Administra locales y disponibilidad por sede.</p>
      </div>
      <button
        class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
        @click="openCreateModal = true"
      >
        Crear sucursal
      </button>
    </header>

    <div class="overflow-hidden rounded-lg border border-[var(--bg-300)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[var(--bg-200)] text-[var(--text-200)]">
          <tr>
            <th class="px-4 py-3 font-medium">Sucursal</th>
            <th class="px-4 py-3 font-medium">Dirección</th>
            <th class="px-4 py-3 font-medium">Tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="3">Cargando sucursales...</td>
          </tr>
          <tr v-else-if="sucursales.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="3">Sin sucursales cargadas.</td>
          </tr>
          <tr v-for="sucursal in sucursales" :key="sucursal.id ?? sucursal.nombre">
            <td class="px-4 py-3 text-[var(--text-100)]">{{ sucursal.nombre }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ sucursal.direccion || '-' }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ sucursal.tipo }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreateSucursalModal
      :open="openCreateModal"
      @close="openCreateModal = false"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped></style>
