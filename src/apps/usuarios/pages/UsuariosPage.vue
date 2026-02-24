<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usuarioApiCreateUsuario, usuarioApiListUsuarios } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { UsuarioCreateSchema, UsuarioSchema } from '../../../api/schemas'
import CreateUsuarioModal from '../components/CreateUsuarioModal.vue'

const openCreateModal = ref(false)
const usuarios = ref<UsuarioSchema[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const loadUsuarios = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await usuarioApiListUsuarios(undefined, buildRequestOptions())
    usuarios.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los usuarios.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: UsuarioCreateSchema) => {
  errorMessage.value = ''

  try {
    await usuarioApiCreateUsuario(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadUsuarios()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el usuario.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadUsuarios()
})
</script>

<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Usuarios</h1>
        <p class="text-sm text-[var(--text-200)]">Gestiona cuentas y permisos del sistema.</p>
      </div>
      <button
        class="rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-medium text-white"
        @click="openCreateModal = true"
      >
        Crear usuario
      </button>
    </header>

    <div class="overflow-hidden rounded-lg border border-[var(--bg-300)] bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[var(--bg-200)] text-[var(--text-200)]">
          <tr>
            <th class="px-4 py-3 font-medium">Usuario</th>
            <th class="px-4 py-3 font-medium">Rol</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="2">Cargando usuarios...</td>
          </tr>
          <tr v-else-if="usuarios.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="2">Sin usuarios cargados.</td>
          </tr>
          <tr v-for="usuario in usuarios" :key="usuario.id ?? usuario.nombre_usuario">
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.nombre_usuario }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.rol || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreateUsuarioModal
      :open="openCreateModal"
      @close="openCreateModal = false"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped></style>
