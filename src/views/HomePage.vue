<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { dashboardApiObtenerEstadisticas } from '../api/generated'
import { buildRequestOptions } from '../api/requestOptions'
import type { DashboardEstadisticas } from '../api/schemas'

const estadisticas = ref<DashboardEstadisticas | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const loadDashboard = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await dashboardApiObtenerEstadisticas(buildRequestOptions())
    estadisticas.value = response.data
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar las estadísticas del dashboard.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadDashboard()
})
</script>

<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-2xl font-bold text-[var(--text-100)]">Panel de Almacén</h1>
      <p class="text-sm text-[var(--text-200)]">Resumen general según dashboard del backend.</p>
    </header>

    <div v-if="isLoading" class="rounded-lg border border-[var(--bg-300)] bg-white p-4 text-sm">
      Cargando dashboard...
    </div>

    <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <template v-else-if="estadisticas">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
          <p class="text-sm text-[var(--text-200)]">Proveedores</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">
            {{ estadisticas.cantidad_proveedores }}
          </p>
        </article>

        <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
          <p class="text-sm text-[var(--text-200)]">Productos</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">
            {{ estadisticas.cantidad_productos }}
          </p>
        </article>

        <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
          <p class="text-sm text-[var(--text-200)]">Pedidos hechos pendientes</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">
            {{ estadisticas.cantidad_pedidos_hechos_pendientes }}
          </p>
        </article>

        <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
          <p class="text-sm text-[var(--text-200)]">Pedidos hechos completados</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">
            {{ estadisticas.cantidad_pedidos_hechos_completados }}
          </p>
        </article>

        <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
          <p class="text-sm text-[var(--text-200)]">Pedidos recibidos pendientes</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">
            {{ estadisticas.cantidad_pedidos_recibidos_pendientes }}
          </p>
        </article>

        <article class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
          <p class="text-sm text-[var(--text-200)]">Pedidos recibidos completados</p>
          <p class="mt-2 text-2xl font-semibold text-[var(--text-100)]">
            {{ estadisticas.cantidad_pedidos_recibidos_completados }}
          </p>
        </article>
      </div>

      <div class="rounded-lg border border-[var(--bg-300)] bg-white p-4">
        <p class="text-sm text-[var(--text-200)]">Usuario autenticado</p>
        <p class="mt-1 text-[var(--text-100)]">{{ estadisticas.usuario_autenticado_nombre }}</p>
        <p class="text-sm text-[var(--text-200)]">
          Sucursal: {{ estadisticas.usuario_autenticado_sucursal }}
        </p>
        <p class="mt-2 text-xs text-[var(--text-200)]">
          Fecha/hora actual: {{ estadisticas.fecha_hora_actual }}
        </p>
      </div>
    </template>
  </section>
</template>

<style scoped></style>
