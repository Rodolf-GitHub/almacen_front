<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usuarioApiListarSucursales } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { Usuario } from '../../../api/schemas'

const sucursales = ref<Usuario[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadSucursales = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await usuarioApiListarSucursales(undefined, buildRequestOptions())
    sucursales.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las sucursales.'
    console.error(error)
  } finally {
    isLoading.value = false
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
        <p class="text-sm text-[var(--text-200)]">Listado de sucursales asociado a usuarios.</p>
      </div>
    </header>

    <div class="overflow-hidden rounded-lg border border-[var(--bg-300)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[var(--bg-200)] text-[var(--text-200)]">
          <tr>
            <th class="px-4 py-3 font-medium">Sucursal</th>
            <th class="px-4 py-3 font-medium">Encargado</th>
            <th class="px-4 py-3 font-medium">Rol</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="3">Cargando sucursales...</td>
          </tr>
          <tr v-else-if="sucursales.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="3">Sin sucursales cargadas.</td>
          </tr>
          <tr
            v-for="sucursal in sucursales"
            :key="sucursal.id ?? `${sucursal.nombre}-${sucursal.nombre_sucursal}`"
          >
            <td class="px-4 py-3 text-[var(--text-100)]">{{ sucursal.nombre_sucursal }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ sucursal.nombre }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ sucursal.rol || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
  </section>
</template>

<style scoped></style>
