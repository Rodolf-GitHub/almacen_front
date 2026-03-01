<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Copy,
  Filter,
  Package,
  RotateCcw,
  Store,
  Trash2,
  User,
} from 'lucide-vue-next'
import {
  pedidoApiCambiarEstadoPedido,
  pedidoApiCopiarPedidoCompleto,
  pedidoApiCrearPedido,
  pedidoApiEliminarPedido,
  pedidoApiListarMisPedidosHechos,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import { PedidoCambiarEstadoEstado } from '../../../api/schemas'
import type { Pedido, PedidoCopiaResumen, PedidoCreate } from '../../../api/schemas'
import CreatePedidoModal from '../components/CreatePedidoModal.vue'
import SearchBar from '../../../components/SearchBar.vue'
import PaginationBar from '../../../components/PaginationBar.vue'

const openCreateModal = ref(false)
const pedidos = ref<Pedido[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const busqueda = ref('')
const currentPage = ref(1)
const totalItems = ref(0)
const pageSize = 100
const router = useRouter()

const loadPedidos = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await pedidoApiListarMisPedidosHechos(
      {
        busqueda: busqueda.value || undefined,
        limit: pageSize,
        offset: (currentPage.value - 1) * pageSize,
      },
      buildRequestOptions(),
    )
    pedidos.value = response.data.items ?? []
    totalItems.value = response.data.count ?? 0
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los pedidos.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: PedidoCreate) => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await pedidoApiCrearPedido(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadPedidos()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el pedido.'
    console.error(error)
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadPedidos()
}

const goPreviousPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await loadPedidos()
}

const goNextPage = async () => {
  const totalPages = Math.max(1, Math.ceil(totalItems.value / pageSize))
  if (currentPage.value >= totalPages) return
  currentPage.value += 1
  await loadPedidos()
}

const goToPedidoProveedores = async (pedido: Pedido) => {
  if (!pedido.id) return
  await router.push({ name: 'pedido-proveedores', params: { pedidoId: pedido.id } })
}

const toggleEstadoPedido = async (pedido: Pedido) => {
  if (!pedido.id) return
  successMessage.value = ''

  const estadoActual =
    pedido.estado === PedidoCambiarEstadoEstado.completado
      ? PedidoCambiarEstadoEstado.completado
      : PedidoCambiarEstadoEstado.pendiente
  const estadoNuevo =
    estadoActual === PedidoCambiarEstadoEstado.completado
      ? PedidoCambiarEstadoEstado.pendiente
      : PedidoCambiarEstadoEstado.completado

  errorMessage.value = ''

  try {
    await pedidoApiCambiarEstadoPedido(pedido.id, { estado: estadoNuevo }, buildRequestOptions())
    await loadPedidos()
  } catch (error) {
    errorMessage.value = 'No se pudo cambiar el estado del pedido.'
    console.error(error)
  }
}

const handleDeletePedido = async (pedido: Pedido) => {
  if (!pedido.id) return
  successMessage.value = ''

  if (!window.confirm(`¿Eliminar el pedido #${pedido.id}?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await pedidoApiEliminarPedido(pedido.id, buildRequestOptions())
    await loadPedidos()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar el pedido.'
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

const buildPedidoTexto = (resumen: PedidoCopiaResumen) => {
  type PedidoCopiaItemConProveedor = {
    producto_id: number
    producto_nombre: string
    cantidad: number
    fecha_creacion: string
    proveedor_id?: number | null
    proveedor_nombre?: string | null
  }

  const lines: string[] = []
  const items = (resumen.productos ?? []) as PedidoCopiaItemConProveedor[]
  lines.push(`DETALLE PEDIDO #${resumen.pedido_id}`)
  lines.push('')
  lines.push(`Estado: ${resumen.estado}`)
  lines.push(`Creado por: ${resumen.creado_por_nombre || '-'}`)
  lines.push(`Destino: ${resumen.usuario_destino_nombre || '-'}`)
  lines.push(`Creación: ${formatFechaHora(resumen.fecha_creacion)}`)
  lines.push(`Actualización: ${formatFechaHora(resumen.fecha_actualizacion)}`)
  lines.push(`Cantidad total de productos: ${resumen.cantidad_total_productos}`)
  lines.push('')
  lines.push('PRODUCTOS')

  if (!items.length) {
    lines.push('- Sin productos')
  } else {
    const tieneProveedorEnItems = items.some(
      (item) => item.proveedor_id != null || !!item.proveedor_nombre,
    )

    if (!tieneProveedorEnItems) {
      for (const producto of items) {
        lines.push(`- ${producto.cantidad} x ${producto.producto_nombre}`)
      }
    } else {
      const grupos = new Map<
        string,
        { proveedorNombre: string; productos: PedidoCopiaItemConProveedor[] }
      >()

      for (const producto of items) {
        const key = String(producto.proveedor_id ?? producto.proveedor_nombre ?? 'sin_proveedor')
        const proveedorNombre = producto.proveedor_nombre || 'Sin proveedor'

        if (!grupos.has(key)) {
          grupos.set(key, { proveedorNombre, productos: [] })
        }

        grupos.get(key)?.productos.push(producto)
      }

      for (const grupo of grupos.values()) {
        lines.push('')
        lines.push(`Proveedor: ${grupo.proveedorNombre}`)

        for (const producto of grupo.productos) {
          lines.push(`- ${producto.cantidad} x ${producto.producto_nombre}`)
        }
      }
    }
  }

  return lines.join('\n')
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

const handleCopyPedido = async (pedido: Pedido) => {
  if (!pedido.id) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await pedidoApiCopiarPedidoCompleto(pedido.id, buildRequestOptions())
    const texto = buildPedidoTexto(response.data)
    await copyToClipboard(texto)
    successMessage.value = `Pedido #${pedido.id} copiado al portapapeles.`
  } catch (error) {
    errorMessage.value = 'No se pudo copiar el pedido.'
    console.error(error)
  }
}

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-AR')
}

const formatHora = (fecha?: string | null) => {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const getCantidadProductos = (pedido: Pedido) => pedido.cantidad_productos ?? 0

const getCardStateClasses = (estado?: string | null) => {
  if (estado === PedidoCambiarEstadoEstado.pendiente) {
    return 'bg-yellow-50 border-yellow-200'
  }

  if (estado === PedidoCambiarEstadoEstado.completado) {
    return 'bg-blue-50 border-blue-200'
  }

  return 'bg-white border-[var(--bg-300)]'
}

const getEstadoColor = (estado?: string | null) => {
  const colors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    completado: 'bg-blue-100 text-blue-800',
  }

  if (!estado) return 'bg-gray-100 text-gray-800'
  return colors[estado] || 'bg-gray-100 text-gray-800'
}

const obtenerDiaLabel = (fecha?: string | null): string => {
  if (!fecha) return 'Pedidos sin fecha'

  const fechaObj = new Date(fecha)
  if (Number.isNaN(fechaObj.getTime())) return 'Pedidos sin fecha'

  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  const antier = new Date(hoy)
  antier.setDate(hoy.getDate() - 2)

  const normalizarFecha = (value: Date) => {
    const copy = new Date(value)
    copy.setHours(0, 0, 0, 0)
    return copy
  }

  const fechaNormalizada = normalizarFecha(fechaObj)

  if (fechaNormalizada.getTime() === normalizarFecha(hoy).getTime()) {
    return 'Pedidos de hoy'
  }

  if (fechaNormalizada.getTime() === normalizarFecha(ayer).getTime()) {
    return 'Pedidos de ayer'
  }

  if (fechaNormalizada.getTime() === normalizarFecha(antier).getTime()) {
    return 'Pedidos de anteayer'
  }

  return `Pedidos del ${fechaObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`
}

const obtenerColorFondo = (diaLabel: string): string => {
  if (diaLabel === 'Pedidos de hoy') return 'bg-blue-50'
  if (diaLabel === 'Pedidos de ayer') return 'bg-green-50'
  if (diaLabel === 'Pedidos de anteayer') return 'bg-orange-50'
  return 'bg-gray-50'
}

const pedidosAgrupados = computed(() => {
  const grupos: Record<string, Pedido[]> = {}

  pedidos.value.forEach((pedido) => {
    const diaLabel = obtenerDiaLabel(pedido.fecha_creacion)
    if (!grupos[diaLabel]) {
      grupos[diaLabel] = []
    }
    grupos[diaLabel].push(pedido)
  })

  const orden = ['Pedidos de hoy', 'Pedidos de ayer', 'Pedidos de anteayer']
  const gruposOrdenados: Record<string, Pedido[]> = {}

  orden.forEach((label) => {
    if (grupos[label]) {
      gruposOrdenados[label] = grupos[label]
    }
  })

  const resto = Object.keys(grupos)
    .filter((label) => !orden.includes(label))
    .sort((a, b) => {
      const fechaA = grupos[a]?.[0]?.fecha_creacion
      const fechaB = grupos[b]?.[0]?.fecha_creacion

      if (!fechaA || !fechaB) return 0
      return new Date(fechaB).getTime() - new Date(fechaA).getTime()
    })

  resto.forEach((label) => {
    if (grupos[label]) {
      gruposOrdenados[label] = grupos[label]
    }
  })

  return gruposOrdenados
})

const pendingCount = computed(
  () =>
    pedidos.value.filter((pedido) => pedido.estado !== PedidoCambiarEstadoEstado.completado).length,
)

onMounted(async () => {
  await loadPedidos()
})
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Pedidos realizados</h1>
        <p class="text-sm text-[var(--text-200)]">Gestiona los pedidos que has creado.</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-medium text-white"
        @click="openCreateModal = true"
      >
        Crear pedido
      </button>
    </header>

    <div
      v-if="pendingCount > 0"
      class="flex flex-col items-center gap-2 rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4 text-center"
    >
      <AlertTriangle :size="22" class="text-yellow-600" />
      <div>
        <div class="text-sm font-semibold">Hay {{ pendingCount }} pedidos sin completar.</div>
        <div class="text-xs text-[var(--text-200)]">
          Recuerda completar los pedidos cuando termines para que el proceso avance.
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-2">
      <Filter :size="16" class="text-sky-700" />
      <p class="text-sm text-sky-800">Listado paginado de pedidos realizados</p>
    </div>

    <div class="w-full">
      <SearchBar
        v-model="busqueda"
        class="w-full"
        placeholder="Buscar pedido por destino o estado..."
        :show-actions="false"
        :auto-search-delay="1000"
        @search="handleSearch"
      />
    </div>

    <div class="space-y-3">
      <div
        v-if="isLoading"
        class="rounded-lg border border-sky-200 bg-white p-4 text-sm text-sky-800"
      >
        Cargando pedidos...
      </div>

      <div v-else-if="pedidos.length === 0" class="rounded-lg bg-white p-8 text-center shadow-sm">
        <p class="text-[var(--text-200)]">No hay pedidos para mostrar</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="diaLabel in Object.keys(pedidosAgrupados)" :key="diaLabel" class="space-y-3">
          <div class="my-6 flex items-center gap-3">
            <div class="flex-1 border-t-2 border-[var(--bg-300)]"></div>
            <p class="whitespace-nowrap px-3 text-sm font-semibold text-[var(--text-100)]">
              {{ diaLabel }}
            </p>
            <div class="flex-1 border-t-2 border-[var(--bg-300)]"></div>
          </div>

          <div
            :class="[
              'rounded-lg border-l-4 p-4 space-y-3',
              obtenerColorFondo(diaLabel),
              diaLabel === 'Pedidos de hoy'
                ? 'border-l-blue-400'
                : diaLabel === 'Pedidos de ayer'
                  ? 'border-l-green-400'
                  : diaLabel === 'Pedidos de anteayer'
                    ? 'border-l-orange-400'
                    : 'border-l-gray-400',
            ]"
          >
            <div
              v-for="pedido in pedidosAgrupados[diaLabel]"
              :key="pedido.id ?? `${pedido.fecha_creacion}-${pedido.creado_por}`"
              :class="[
                'flex flex-col gap-3 rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center',
                getCardStateClasses(pedido.estado),
              ]"
            >
              <div class="flex-1 min-w-0">
                <p class="mb-1 text-xs font-semibold text-sky-700">
                  Pedido #{{ pedido.id || '-' }}
                </p>
                <p
                  class="flex items-center gap-2 truncate text-sm font-medium text-[var(--text-200)]"
                >
                  <Store :size="16" />
                  <span class="text-[var(--text-200)]">Destino:</span>
                  <span class="font-semibold text-[var(--text-100)]">
                    {{
                      pedido.usuario_destino_nombre ||
                      (pedido.usuario_destino ? `#${pedido.usuario_destino}` : '-')
                    }}
                  </span>
                </p>
                <p class="mt-1 flex items-center gap-2 text-sm text-[var(--text-200)]">
                  <Calendar :size="16" />
                  <span>Fecha:</span>
                  <span class="font-semibold text-[var(--text-100)]">{{
                    formatFecha(pedido.fecha_creacion)
                  }}</span>
                  <span class="text-[var(--text-200)]">•</span>
                  <span class="font-semibold text-[var(--text-100)]">{{
                    formatHora(pedido.fecha_creacion)
                  }}</span>
                </p>
                <p class="mt-1 flex items-center gap-2 text-sm text-[var(--text-200)]">
                  <User :size="16" />
                  <span>Creado por:</span>
                  <span class="font-semibold text-[var(--text-100)]">
                    {{ pedido.creado_por_nombre || `#${pedido.creado_por}` }}
                  </span>
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <span
                    :class="[
                      'rounded-full px-2 py-1 text-xs font-medium',
                      getEstadoColor(pedido.estado),
                    ]"
                  >
                    {{ pedido.estado || '-' }}
                  </span>
                  <span class="text-xs text-[var(--text-200)]">
                    {{ getCantidadProductos(pedido) }} producto(s)
                  </span>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-indigo-700 hover:bg-indigo-100"
                  title="Ver proveedores"
                  @click="goToPedidoProveedores(pedido)"
                >
                  <Package :size="16" />
                  Ver proveedores
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1.5 text-cyan-700 hover:bg-cyan-100"
                  title="Copiar pedido"
                  @click="handleCopyPedido(pedido)"
                >
                  <Copy :size="16" />
                  Copiar pedido
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-emerald-700 hover:bg-emerald-100"
                  :title="
                    pedido.estado === PedidoCambiarEstadoEstado.completado
                      ? 'Marcar pendiente'
                      : 'Marcar completado'
                  "
                  @click="toggleEstadoPedido(pedido)"
                >
                  <component
                    :is="
                      pedido.estado === PedidoCambiarEstadoEstado.completado
                        ? RotateCcw
                        : CheckCircle2
                    "
                    :size="16"
                  />
                  {{
                    pedido.estado === PedidoCambiarEstadoEstado.completado
                      ? 'Marcar pendiente'
                      : 'Marcar completado'
                  }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-600 hover:bg-red-100"
                  title="Eliminar pedido"
                  @click="handleDeletePedido(pedido)"
                >
                  <Trash2 :size="16" />
                  Eliminar
                </button>
              </div>
            </div>
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

    <p v-if="successMessage" class="text-sm text-emerald-700">{{ successMessage }}</p>
    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreatePedidoModal
      :open="openCreateModal"
      @close="openCreateModal = false"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped></style>
