<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { proveedorApiCreateProveedor, proveedorApiListProveedores } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { ProveedorCreateSchema, ProveedorSchema } from '../../../api/schemas'
import CreateProveedorModal from '../components/CreateProveedorModal.vue'

const openCreateModal = ref(false)
const proveedores = ref<ProveedorSchema[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadProveedores = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await proveedorApiListProveedores(undefined, buildRequestOptions())
    proveedores.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los proveedores.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: ProveedorCreateSchema) => {
  errorMessage.value = ''

  try {
    await proveedorApiCreateProveedor(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadProveedores()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el proveedor.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadProveedores()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Proveedores</h1>
        <p class="text-sm text-[var(--text-200)]">Controla los proveedores del almacén.</p>
      </div>
      <button
        class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
        @click="openCreateModal = true"
      >
        Crear proveedor
      </button>
    </header>

    <div class="overflow-hidden rounded-lg border border-[var(--bg-300)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[var(--bg-200)] text-[var(--text-200)]">
          <tr>
            <th class="px-4 py-3 font-medium">Proveedor</th>
            <th class="px-4 py-3 font-medium">Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="2">Cargando proveedores...</td>
          </tr>
          <tr v-else-if="proveedores.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="2">Sin proveedores cargados.</td>
          </tr>
          <tr v-for="proveedor in proveedores" :key="proveedor.id ?? proveedor.nombre">
            <td class="px-4 py-3 text-[var(--text-100)]">{{ proveedor.nombre }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ proveedor.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreateProveedorModal
      :open="openCreateModal"
      @close="openCreateModal = false"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped></style>
