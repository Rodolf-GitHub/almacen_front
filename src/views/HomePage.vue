<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BarChart3, Calendar, Package, Store, UserCircle2, Warehouse } from 'lucide-vue-next'
import { dashboardApiObtenerEstadisticas } from '../api/generated'
import { buildRequestOptions } from '../api/requestOptions'
import type { DashboardEstadisticas } from '../api/schemas'

const estadisticas = ref<DashboardEstadisticas | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const formatFechaHora = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const fecha = date.toLocaleDateString('es-AR')
  const hora = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return `${fecha} • ${hora}`
}

const totalPedidosHechos = computed(() => {
  if (!estadisticas.value) return 0
  return (
    estadisticas.value.cantidad_pedidos_hechos_pendientes +
    estadisticas.value.cantidad_pedidos_hechos_completados
  )
})

const totalPedidosRecibidos = computed(() => {
  if (!estadisticas.value) return 0
  return (
    estadisticas.value.cantidad_pedidos_recibidos_pendientes +
    estadisticas.value.cantidad_pedidos_recibidos_completados
  )
})

const porcentajeCompletadoHechos = computed(() => {
  if (!estadisticas.value || totalPedidosHechos.value === 0) return 0
  return Math.round(
    (estadisticas.value.cantidad_pedidos_hechos_completados / totalPedidosHechos.value) * 100,
  )
})

const porcentajeCompletadoRecibidos = computed(() => {
  if (!estadisticas.value || totalPedidosRecibidos.value === 0) return 0
  return Math.round(
    (estadisticas.value.cantidad_pedidos_recibidos_completados / totalPedidosRecibidos.value) * 100,
  )
})

const maxComparativa = computed(() => {
  if (!estadisticas.value) return 1

  return Math.max(
    1,
    estadisticas.value.cantidad_pedidos_hechos_pendientes,
    estadisticas.value.cantidad_pedidos_hechos_completados,
    estadisticas.value.cantidad_pedidos_recibidos_pendientes,
    estadisticas.value.cantidad_pedidos_recibidos_completados,
  )
})

const comparativaSeries = computed(() => {
  if (!estadisticas.value) return [] as Array<{ label: string; value: number; color: string }>

  return [
    {
      label: 'Hechos pendientes',
      value: estadisticas.value.cantidad_pedidos_hechos_pendientes,
      color: 'bg-amber-400',
    },
    {
      label: 'Hechos completados',
      value: estadisticas.value.cantidad_pedidos_hechos_completados,
      color: 'bg-emerald-500',
    },
    {
      label: 'Recibidos pendientes',
      value: estadisticas.value.cantidad_pedidos_recibidos_pendientes,
      color: 'bg-indigo-400',
    },
    {
      label: 'Recibidos completados',
      value: estadisticas.value.cantidad_pedidos_recibidos_completados,
      color: 'bg-sky-500',
    },
  ]
})

const getBarWidth = (value: number) => {
  return `${Math.max(8, Math.round((value / maxComparativa.value) * 100))}%`
}

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
  <section class="space-y-6">
    <header
      class="rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-5 text-white shadow-lg"
    >
      <p class="text-sm/6 text-white/90">
        <Calendar :size="15" class="mr-1 inline-block" />
        {{ formatFechaHora(estadisticas?.fecha_hora_actual) }}
      </p>
      <h1 class="mt-1 text-2xl font-extrabold md:text-3xl">
        Bienvenido {{ estadisticas?.usuario_autenticado_nombre || 'Usuario' }}
      </h1>
      <p class="mt-1 text-sm text-white/90">Panel de control operativo del almacén</p>
    </header>

    <div v-if="isLoading" class="rounded-lg border border-[var(--bg-300)] bg-white p-4 text-sm">
      Cargando dashboard...
    </div>

    <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <template v-else-if="estadisticas">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          class="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4"
        >
          <p class="text-sm text-sky-700">Proveedores</p>
          <p class="mt-2 text-2xl font-semibold text-sky-900">
            {{ estadisticas.cantidad_proveedores }}
          </p>
        </article>

        <article
          class="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4"
        >
          <p class="text-sm text-emerald-700">Productos</p>
          <p class="mt-2 text-2xl font-semibold text-emerald-900">
            {{ estadisticas.cantidad_productos }}
          </p>
        </article>

        <article
          class="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4"
        >
          <p class="text-sm text-amber-700">Pedidos hechos pendientes</p>
          <p class="mt-2 text-2xl font-semibold text-amber-900">
            {{ estadisticas.cantidad_pedidos_hechos_pendientes }}
          </p>
        </article>

        <article
          class="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4"
        >
          <p class="text-sm text-indigo-700">Pedidos hechos completados</p>
          <p class="mt-2 text-2xl font-semibold text-indigo-900">
            {{ estadisticas.cantidad_pedidos_hechos_completados }}
          </p>
        </article>

        <article
          class="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4"
        >
          <p class="text-sm text-rose-700">Pedidos recibidos pendientes</p>
          <p class="mt-2 text-2xl font-semibold text-rose-900">
            {{ estadisticas.cantidad_pedidos_recibidos_pendientes }}
          </p>
        </article>

        <article
          class="rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4"
        >
          <p class="text-sm text-cyan-700">Pedidos recibidos completados</p>
          <p class="mt-2 text-2xl font-semibold text-cyan-900">
            {{ estadisticas.cantidad_pedidos_recibidos_completados }}
          </p>
        </article>

        <article
          class="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 md:col-span-2"
        >
          <p class="text-sm text-violet-700">Usuario autenticado</p>
          <p class="mt-2 flex items-center gap-2 text-lg font-semibold text-violet-900">
            <UserCircle2 :size="20" />
            {{ estadisticas.usuario_autenticado_nombre }}
          </p>
          <p class="mt-1 text-sm text-violet-700">
            Sucursal: {{ estadisticas.usuario_autenticado_sucursal }}
          </p>
          <p class="mt-1 text-sm text-violet-700">
            Fecha/hora actual: {{ formatFechaHora(estadisticas.fecha_hora_actual) }}
          </p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <p class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <BarChart3 :size="16" />
            Cumplimiento de pedidos
          </p>

          <div class="space-y-3">
            <div>
              <div class="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Pedidos hechos completados</span>
                <span>{{ porcentajeCompletadoHechos }}%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div
                  class="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-500"
                  :style="{ width: `${porcentajeCompletadoHechos}%` }"
                ></div>
              </div>
            </div>

            <div>
              <div class="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Pedidos recibidos completados</span>
                <span>{{ porcentajeCompletadoRecibidos }}%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div
                  class="h-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
                  :style="{ width: `${porcentajeCompletadoRecibidos}%` }"
                ></div>
              </div>
            </div>
          </div>
        </article>

        <article
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2 xl:col-span-4"
        >
          <p class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Warehouse :size="16" />
            Gráfico comparativo de pedidos
          </p>

          <div class="space-y-3">
            <div v-for="item in comparativaSeries" :key="item.label" class="space-y-1">
              <div class="flex items-center justify-between text-xs text-slate-600">
                <span>{{ item.label }}</span>
                <span class="font-semibold text-slate-800">{{ item.value }}</span>
              </div>
              <div class="h-3 rounded-full bg-slate-100">
                <div
                  :class="['h-3 rounded-full transition-all', item.color]"
                  :style="{ width: getBarWidth(item.value) }"
                ></div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped></style>
