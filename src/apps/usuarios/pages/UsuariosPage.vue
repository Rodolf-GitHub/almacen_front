<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usuarioApiCrearUsuario, usuarioApiListarUsuarios } from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { Usuario, UsuarioCreate } from '../../../api/schemas'
import CreateUsuarioModal from '../components/CreateUsuarioModal.vue'

const route = useRoute()
const router = useRouter()
const openCreateModal = ref(false)
const usuarios = ref<Usuario[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const syncCreateModalWithRoute = () => {
  openCreateModal.value = route.name === 'usuarios-crear'
}

const loadUsuarios = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await usuarioApiListarUsuarios(undefined, buildRequestOptions())
    usuarios.value = response.data.items ?? []
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los usuarios.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSaved = async (payload: UsuarioCreate) => {
  errorMessage.value = ''

  try {
    await usuarioApiCrearUsuario(payload, buildRequestOptions())
    openCreateModal.value = false
    await loadUsuarios()

    if (route.name === 'usuarios-crear') {
      await router.push({ name: 'usuarios-gestion' })
    }
  } catch (error) {
    errorMessage.value = 'No se pudo crear el usuario.'
    console.error(error)
  }
}

const openCreate = async () => {
  if (route.name !== 'usuarios-crear') {
    await router.push({ name: 'usuarios-crear' })
    return
  }

  openCreateModal.value = true
}

const closeCreateModal = async () => {
  openCreateModal.value = false

  if (route.name === 'usuarios-crear') {
    await router.push({ name: 'usuarios-gestion' })
  }
}

watch(
  () => route.name,
  () => {
    syncCreateModalWithRoute()
  },
)

onMounted(async () => {
  await loadUsuarios()
  syncCreateModalWithRoute()
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
        @click="openCreate"
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
          <tr v-for="usuario in usuarios" :key="usuario.id ?? usuario.nombre">
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.nombre }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.rol || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreateUsuarioModal :open="openCreateModal" @close="closeCreateModal" @saved="handleSaved" />
  </section>
</template>

<style scoped></style>
