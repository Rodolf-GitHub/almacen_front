<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UsuarioCreateRol } from '../../../api/schemas'
import type { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../api/schemas'

const props = defineProps<{ open: boolean; usuario?: Usuario | null }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', payload: UsuarioCreate): void
  (e: 'updated', payload: { id: number; body: UsuarioUpdate }): void
}>()

const nombre = ref('')
const contrasena = ref('')
const nombreSucursal = ref('')
const rol = ref<UsuarioCreate['rol']>(UsuarioCreateRol.admin_sucursal)
const isEditMode = computed(() => props.usuario?.id != null)

watch(
  () => [props.open, props.usuario] as const,
  (isOpen) => {
    if (isOpen[0]) {
      nombre.value = props.usuario?.nombre ?? ''
      contrasena.value = ''
      nombreSucursal.value = props.usuario?.nombre_sucursal ?? ''
      rol.value =
        props.usuario?.rol === UsuarioCreateRol.admin_general
          ? UsuarioCreateRol.admin_general
          : UsuarioCreateRol.admin_sucursal
    }
  },
  { immediate: true },
)

const close = () => emit('close')

const submit = () => {
  if (isEditMode.value && props.usuario?.id) {
    const body: UsuarioUpdate = {
      nombre: nombre.value,
      nombre_sucursal: nombreSucursal.value,
      rol: rol.value,
    }

    if (contrasena.value.trim()) {
      body.contrasena = contrasena.value
    }

    emit('updated', { id: props.usuario.id, body })
    return
  }

  emit('created', {
    nombre: nombre.value,
    contrasena: contrasena.value,
    nombre_sucursal: nombreSucursal.value,
    rol: rol.value,
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-100)]/50 px-4"
  >
    <div class="w-full max-w-md rounded-lg border border-[var(--bg-300)] bg-white p-5 shadow-lg">
      <h2 class="text-lg font-semibold text-[var(--text-100)]">
        {{ isEditMode ? 'Editar usuario' : 'Crear usuario' }}
      </h2>
      <form class="mt-4 space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Nombre de usuario</label>
          <input
            v-model="nombre"
            required
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">
            Contraseña
            <span v-if="isEditMode" class="text-xs text-sky-500"
              >(dejar vacío para no cambiar)</span
            >
          </label>
          <input
            v-model="contrasena"
            type="password"
            :required="!isEditMode"
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Sucursal</label>
          <input
            v-model="nombreSucursal"
            required
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">
            Rol <span class="text-xs text-sky-500">(no obligatorio)</span>
          </label>
          <select
            v-model="rol"
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          >
            <option :value="UsuarioCreateRol.admin_sucursal">Admin sucursal</option>
            <option :value="UsuarioCreateRol.admin_general">Admin general</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-md border border-[var(--bg-300)] px-4 py-2 text-sm text-[var(--text-100)]"
            @click="close"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
          >
            {{ isEditMode ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
