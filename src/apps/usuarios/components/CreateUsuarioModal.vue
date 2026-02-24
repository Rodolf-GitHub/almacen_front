<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UsuarioCreateSchema } from '../../../api/schemas'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', payload: UsuarioCreateSchema): void }>()

const nombreUsuario = ref('')
const contrasena = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      nombreUsuario.value = ''
      contrasena.value = ''
    }
  },
)

const close = () => emit('close')

const submit = () => {
  emit('saved', {
    nombre_usuario: nombreUsuario.value,
    contrasena_hasheada: contrasena.value,
  })
  close()
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-100)]/50 px-4"
  >
    <div class="w-full max-w-md rounded-lg border border-[var(--bg-300)] bg-white p-5 shadow-lg">
      <h2 class="text-lg font-semibold text-[var(--text-100)]">Crear usuario</h2>
      <form class="mt-4 space-y-3" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Nombre de usuario</label>
          <input
            v-model="nombreUsuario"
            required
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Contraseña</label>
          <input
            v-model="contrasena"
            type="password"
            required
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
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
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
