<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Building2, DollarSign, FileText, Image as ImageIcon, Tag } from 'lucide-vue-next'
import BaseModal from '../../../components/BaseModal.vue'
import type {
  CategoriaProductoSchema,
  ProductoApiActualizarProductoBody,
  ProductoApiCrearProductoBody,
  ProductoCreate,
  ProductoDetail,
  ProductoUpdate,
  Proveedor,
} from '../../../api/schemas'

const props = defineProps<{
  open: boolean
  proveedores: Proveedor[]
  categorias: CategoriaProductoSchema[]
  producto?: ProductoDetail | null
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', payload: ProductoApiCrearProductoBody): void
  (e: 'updated', payload: { id: number; body: ProductoApiActualizarProductoBody }): void
}>()

const nombre = ref('')
const proveedorId = ref<number | null>(null)
const descripcion = ref('')
const precioCompra = ref<number | null>(null)
const precioVenta = ref<number | null>(null)
const categoriaId = ref<number | null>(null)
const imagen = ref<File | undefined>(undefined)
const imagenPreview = ref<string | null>(null)

const isEditMode = computed(() => props.producto?.id != null)

const parsePrice = (value?: string | null): number | null => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const resolveImageUrl = (image?: string | null) => {
  if (!image) return null
  if (image.startsWith('http://') || image.startsWith('https://')) return image

  const cleanPath = image.startsWith('/') ? image : `/${image}`
  const backendBaseUrl =
    (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    'http://127.0.0.1:8000'

  return new URL(cleanPath, backendBaseUrl).toString()
}

const fillFromProducto = (producto: ProductoDetail) => {
  nombre.value = producto.nombre
  proveedorId.value = producto.proveedor
  descripcion.value = producto.descripcion || ''
  precioCompra.value = parsePrice(producto.precio_compra)
  precioVenta.value = parsePrice(producto.precio_venta)
  categoriaId.value = producto.categoria ?? null
  imagen.value = undefined
  imagenPreview.value = resolveImageUrl(producto.imagen)
}

const fillCreateDefaults = () => {
  nombre.value = ''
  proveedorId.value = props.proveedores.find((proveedor) => proveedor.id != null)?.id ?? null
  descripcion.value = ''
  precioCompra.value = null
  precioVenta.value = null
  categoriaId.value = null
  imagen.value = undefined
  imagenPreview.value = null
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.producto) {
        fillFromProducto(props.producto)
      } else {
        fillCreateDefaults()
      }
    }
  },
)

const close = () => emit('close')

const onImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    imagen.value = undefined
    return
  }

  imagen.value = file
  imagenPreview.value = URL.createObjectURL(file)
}

const submit = () => {
  if (!proveedorId.value) {
    return
  }

  if (isEditMode.value && props.producto?.id) {
    const updateData: ProductoUpdate = {
      proveedor_id: proveedorId.value,
      nombre: nombre.value,
      descripcion: descripcion.value || null,
      precio_compra: precioCompra.value,
      precio_venta: precioVenta.value,
      categoria_id: categoriaId.value,
    }

    emit('updated', {
      id: props.producto.id,
      body: {
        data: updateData,
        imagen: imagen.value,
      },
    })
    close()
    return
  }

  const createData: ProductoCreate = {
    proveedor_id: proveedorId.value,
    nombre: nombre.value,
    descripcion: descripcion.value || null,
    precio_compra: precioCompra.value,
    precio_venta: precioVenta.value,
    categoria_id: categoriaId.value,
  }

  emit('created', {
    data: createData,
    imagen: imagen.value,
  })
  close()
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEditMode ? 'Editar producto' : 'Crear producto'"
    max-width-class="max-w-lg"
    @close="close"
  >
    <form class="space-y-3" @submit.prevent="submit">
      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Tag :size="16" />
          Nombre
        </label>
        <input
          v-model="nombre"
          required
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
            <DollarSign :size="16" />
            Precio compra
            <span class="text-xs text-sky-500">(no obligatorio)</span>
          </label>
          <input
            v-model.number="precioCompra"
            type="number"
            min="0"
            class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
          />
        </div>
        <div>
          <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
            <DollarSign :size="16" />
            Precio venta
            <span class="text-xs text-sky-500">(no obligatorio)</span>
          </label>
          <input
            v-model.number="precioVenta"
            type="number"
            min="0"
            class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Building2 :size="16" />
          Proveedor
        </label>
        <select
          v-model.number="proveedorId"
          required
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        >
          <option :value="null" disabled>Selecciona un proveedor</option>
          <option v-for="proveedor in props.proveedores" :key="proveedor.id" :value="proveedor.id">
            {{ proveedor.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <Tag :size="16" />
          Categoría
          <span class="text-xs text-sky-500">(no obligatorio)</span>
        </label>
        <select
          v-model.number="categoriaId"
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        >
          <option :value="null">Sin categoría</option>
          <option v-for="categoria in props.categorias" :key="categoria.id" :value="categoria.id">
            {{ categoria.nombre }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <ImageIcon :size="16" />
          Imagen
          <span class="text-xs text-sky-500">(no obligatorio)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 text-sm outline-none focus:border-sky-400"
          @change="onImageSelected"
        />
        <div class="mt-2 flex items-center gap-3 rounded-md border border-sky-100 bg-sky-50 p-2">
          <img
            v-if="imagenPreview"
            :src="imagenPreview"
            alt="Vista previa producto"
            class="h-16 w-16 rounded-md border border-sky-200 object-cover"
          />
          <div
            v-else
            class="flex h-16 w-16 items-center justify-center rounded-md border border-sky-200 bg-white"
          >
            <ImageIcon :size="20" class="text-sky-400" />
          </div>
          <p class="text-xs text-sky-700">
            {{ imagen ? imagen.name : 'Sin imagen seleccionada' }}
          </p>
        </div>
      </div>

      <div>
        <label class="mb-1 flex items-center gap-2 text-sm text-sky-800">
          <FileText :size="16" />
          Descripción
          <span class="text-xs text-sky-500">(no obligatorio)</span>
        </label>
        <input
          v-model="descripcion"
          class="w-full rounded-md border border-sky-200 bg-sky-50/40 px-3 py-2 outline-none focus:border-sky-400"
        />
      </div>

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
          {{ isEditMode ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped></style>
