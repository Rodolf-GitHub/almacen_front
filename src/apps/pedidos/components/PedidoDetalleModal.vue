<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { productoApiListarProductosPorProveedor } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type {
  PedidoDetalle,
  PedidoDetalleCreate,
  PedidoDetalleUpdate,
  ProductoList,
} from '../../../api/schemas'
import BaseModal from '../../../components/BaseModal.vue'
import SearchBar from '../../../components/SearchBar.vue'

const props = defineProps<{
  open: boolean
  pedidoId: number
  proveedorId: number
  detalle?: PedidoDetalle | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', payload: PedidoDetalleCreate): void
  (e: 'updated', payload: { id: number; body: PedidoDetalleUpdate }): void
}>()

const productos = ref<ProductoList[]>([])
const productoId = ref<number | null>(null)
const cantidad = ref<number>(1)
const isLoadingProductos = ref(false)
const errorMessage = ref('')
const busquedaProducto = ref('')

const isEditMode = computed(() => props.detalle?.id != null)

const loadProductos = async () => {
  if (isEditMode.value) return

  isLoadingProductos.value = true
  errorMessage.value = ''

  try {
    const response = await productoApiListarProductosPorProveedor(
      props.proveedorId,
      {
        busqueda: busquedaProducto.value || undefined,
        limit: 100,
        offset: 0,
      },
      buildRequestOptions(),
    )
    productos.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los productos del proveedor.'
    console.error(error)
  } finally {
    isLoadingProductos.value = false
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return

    errorMessage.value = ''

    if (props.detalle) {
      cantidad.value = props.detalle.cantidad
      productoId.value = props.detalle.producto
      productos.value = []
      busquedaProducto.value = ''
      return
    }

    cantidad.value = 1
    productoId.value = null
    busquedaProducto.value = ''
    await loadProductos()
  },
)

const handleSearchProductos = async () => {
  productoId.value = null
  await loadProductos()
}

const close = () => emit('close')

const submit = () => {
  if (isEditMode.value && props.detalle?.id) {
    emit('updated', {
      id: props.detalle.id,
      body: { cantidad: cantidad.value },
    })
    close()
    return
  }

  if (!productoId.value) return

  emit('created', {
    pedido_id: props.pedidoId,
    producto_id: productoId.value,
    cantidad: cantidad.value,
  })
  close()
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditMode ? 'Editar producto del pedido' : 'Agregar producto al pedido'"
    max-width-class="max-w-lg"
    @close="close"
  >
    <form class="space-y-3" @submit.prevent="submit">
      <div v-if="isEditMode">
        <label class="mb-1 block text-sm text-sky-800">Producto</label>
        <input
          :value="detalle?.producto_nombre || `#${detalle?.producto}`"
          disabled
          class="w-full rounded-md border border-sky-200 bg-sky-100/40 px-3 py-2 text-sky-700"
        />
      </div>

      <div v-else>
        <SearchBar
          v-model="busquedaProducto"
          class="w-full"
          placeholder="Buscar producto por nombre..."
          :show-actions="false"
          :auto-search-delay="500"
          @search="handleSearchProductos"
        />

        <label class="mb-1 block text-sm text-sky-800">Producto</label>
        <select
          v-model.number="productoId"
          required
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        >
          <option :value="null" disabled>
            {{ isLoadingProductos ? 'Cargando productos...' : 'Selecciona un producto' }}
          </option>
          <option
            v-for="producto in productos"
            :key="producto.id ?? producto.nombre"
            :value="producto.id"
          >
            {{ producto.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm text-sky-800">Cantidad</label>
        <input
          v-model.number="cantidad"
          required
          type="number"
          min="1"
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <div class="flex justify-end gap-2 border-t border-sky-100 pt-3">
        <button
          type="button"
          class="rounded-md border border-sky-200 bg-white px-4 py-2 text-sm text-sky-700 hover:bg-sky-50"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-md bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-medium text-white"
        >
          {{ isEditMode ? 'Actualizar' : 'Agregar' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped></style>
