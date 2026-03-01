<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, Copy, Package } from 'lucide-vue-next'
import {
  pedidoApiCopiarPedidoPorProveedor,
  pedidoApiListarProveedoresResumenPorPedido,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { PedidoCopiaResumen, PedidoProveedorResumen } from '../../../api/schemas'
import TableLayout from '../../../components/TableLayout.vue'

const route = useRoute()
const router = useRouter()

const proveedores = ref<PedidoProveedorResumen[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const pedidoId = Number.parseInt(route.params.pedidoId as string, 10)

const loadProveedoresResumen = async () => {
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    errorMessage.value = 'Pedido inválido.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await pedidoApiListarProveedoresResumenPorPedido(
      pedidoId,
      buildRequestOptions(),
    )
    proveedores.value = response.data ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los proveedores del pedido.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const goToProveedorProductos = async (proveedor: PedidoProveedorResumen) => {
  await router.push({
    name: 'pedido-proveedor-productos',
    params: {
      pedidoId,
      proveedorId: proveedor.proveedor_id,
    },
    query: { proveedorNombre: proveedor.proveedor_nombre },
  })
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
  lines.push(`Proveedor: ${resumen.proveedor_nombre || '-'}`)
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

const handleCopyProveedor = async (proveedor: PedidoProveedorResumen) => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await pedidoApiCopiarPedidoPorProveedor(
      pedidoId,
      proveedor.proveedor_id,
      buildRequestOptions(),
    )
    await copyToClipboard(buildPedidoTexto(response.data))
    successMessage.value = `Pedido del proveedor "${proveedor.proveedor_nombre}" copiado.`
  } catch (error) {
    errorMessage.value = 'No se pudo copiar el pedido por proveedor.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadProveedoresResumen()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Proveedores del pedido</h1>
        <p class="text-sm text-[var(--text-200)]">Pedido #{{ pedidoId }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
        @click="router.back()"
      >
        <ArrowLeft :size="16" />
        Volver
      </button>
    </header>

    <div
      v-if="isLoading"
      class="rounded-lg border border-sky-200 bg-white p-4 text-sm text-sky-800"
    >
      Cargando proveedores...
    </div>

    <p v-else-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <div
      v-else-if="proveedores.length === 0"
      class="rounded-lg border border-sky-200 bg-white p-4 text-sm text-sky-800"
    >
      Este pedido no tiene proveedores asociados.
    </div>

    <TableLayout
      v-else
      :headers="['Proveedor', 'Productos pedidos', 'Acciones']"
      :loading="isLoading"
      loading-text="Cargando proveedores..."
      :empty="proveedores.length === 0"
      empty-text="Este pedido no tiene proveedores asociados."
    >
      <tr
        v-for="proveedor in proveedores"
        :key="`${proveedor.proveedor_id}-${proveedor.proveedor_nombre}`"
        class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
      >
        <td class="px-2 py-2 text-sky-900 sm:px-3">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700"
            >
              <Building2 :size="16" />
            </span>
            <span class="font-semibold">{{ proveedor.proveedor_nombre }}</span>
          </div>
        </td>
        <td class="px-2 py-2 text-sky-900 sm:px-3">{{ proveedor.cantidad_productos_pedidos }}</td>
        <td class="px-2 py-2 sm:px-3">
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-indigo-700 hover:bg-indigo-100"
              title="Ver productos"
              @click="goToProveedorProductos(proveedor)"
            >
              <Package :size="16" />
              Ver productos
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1.5 text-cyan-700 hover:bg-cyan-100"
              title="Copiar pedido por proveedor"
              @click="handleCopyProveedor(proveedor)"
            >
              <Copy :size="16" />
              Copiar
            </button>
          </div>
        </td>
      </tr>
    </TableLayout>

    <p v-if="successMessage" class="text-sm text-emerald-700">{{ successMessage }}</p>
  </section>
</template>

<style scoped></style>
