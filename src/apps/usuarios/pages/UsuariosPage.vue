<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Info, Pencil, Trash2 } from 'lucide-vue-next'
import {
  usuarioApiActualizarUsuario,
  usuarioApiCrearUsuario,
  usuarioApiEliminarUsuario,
  usuarioApiListarUsuarios,
  usuarioApiObtenerUsuario,
} from '../../../api/generated'
import { buildRequestOptions } from '../../../api/requestOptions'
import type { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../api/schemas'
import BaseModal from '../../../components/BaseModal.vue'
import CreateButton from '../../../components/CreateButton.vue'
import TitleCard from '../../../components/TitleCard.vue'
import CreateUsuarioModal from '../components/CreateUsuarioModal.vue'

const openCreateModal = ref(false)
const usuarios = ref<Usuario[]>([])
const selectedUsuario = ref<Usuario | null>(null)
const infoUsuario = ref<Usuario | null>(null)
const openInfoModal = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

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

const openCreate = () => {
  selectedUsuario.value = null
  openCreateModal.value = true
}

const openEdit = async (usuario: Usuario) => {
  if (!usuario.id) return

  errorMessage.value = ''

  try {
    const response = await usuarioApiObtenerUsuario(usuario.id, buildRequestOptions())
    selectedUsuario.value = response.data
    openCreateModal.value = true
  } catch (error) {
    errorMessage.value = 'No se pudo cargar el usuario para editar.'
    console.error(error)
  }
}

const openInfo = async (usuario: Usuario) => {
  if (!usuario.id) return

  errorMessage.value = ''

  try {
    const response = await usuarioApiObtenerUsuario(usuario.id, buildRequestOptions())
    infoUsuario.value = response.data
    openInfoModal.value = true
  } catch (error) {
    errorMessage.value = 'No se pudo cargar la información del usuario.'
    console.error(error)
  }
}

const handleDelete = async (usuario: Usuario) => {
  if (!usuario.id) return

  if (!window.confirm(`¿Eliminar el usuario "${usuario.nombre}"?`)) {
    return
  }

  errorMessage.value = ''

  try {
    await usuarioApiEliminarUsuario(usuario.id, buildRequestOptions())
    await loadUsuarios()
  } catch (error) {
    errorMessage.value = 'No se pudo eliminar el usuario.'
    console.error(error)
  }
}

const handleCreated = async (payload: UsuarioCreate) => {
  errorMessage.value = ''

  try {
    await usuarioApiCrearUsuario(payload, buildRequestOptions())
    selectedUsuario.value = null
    openCreateModal.value = false
    await loadUsuarios()
  } catch (error) {
    errorMessage.value = 'No se pudo crear el usuario.'
    console.error(error)
  }
}

const handleUpdated = async (payload: { id: number; body: UsuarioUpdate }) => {
  errorMessage.value = ''

  try {
    await usuarioApiActualizarUsuario(payload.id, payload.body, buildRequestOptions())
    selectedUsuario.value = null
    openCreateModal.value = false
    await loadUsuarios()
  } catch (error) {
    errorMessage.value = 'No se pudo actualizar el usuario.'
    console.error(error)
  }
}

onMounted(async () => {
  await loadUsuarios()
})
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-3">
      <TitleCard title="Usuarios" description="Gestiona cuentas y permisos del sistema." />
      <CreateButton label="Crear usuario" @click="openCreate" />
    </header>

    <div class="overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-sky-50 text-sky-800">
          <tr>
            <th class="px-4 py-3 font-medium">Usuario</th>
            <th class="px-4 py-3 font-medium">Sucursal</th>
            <th class="px-4 py-3 font-medium">Rol</th>
            <th class="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="4">Cargando usuarios...</td>
          </tr>
          <tr v-else-if="usuarios.length === 0">
            <td class="px-4 py-4 text-[var(--text-100)]" colspan="4">Sin usuarios cargados.</td>
          </tr>
          <tr
            v-for="usuario in usuarios"
            :key="usuario.id ?? usuario.nombre"
            class="odd:bg-white even:bg-sky-50/35 hover:bg-sky-100/40"
          >
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.nombre }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.nombre_sucursal || '-' }}</td>
            <td class="px-4 py-3 text-[var(--text-100)]">{{ usuario.rol || '-' }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
                  title="Información"
                  @click="openInfo(usuario)"
                >
                  <Info :size="16" />
                </button>
                <button
                  type="button"
                  class="rounded-md border border-sky-200 bg-white p-2 text-sky-700 hover:bg-sky-100"
                  title="Editar"
                  @click="openEdit(usuario)"
                >
                  <Pencil :size="16" />
                </button>
                <button
                  type="button"
                  class="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  title="Eliminar"
                  @click="handleDelete(usuario)"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <CreateUsuarioModal
      :open="openCreateModal"
      :usuario="selectedUsuario"
      @close="openCreateModal = false"
      @created="handleCreated"
      @updated="handleUpdated"
    />

    <BaseModal
      :open="openInfoModal"
      title="Detalle del usuario"
      max-width-class="max-w-md"
      @close="openInfoModal = false"
    >
      <div v-if="infoUsuario" class="space-y-3 text-sm text-sky-900">
        <p><span class="font-medium text-sky-700">ID:</span> {{ infoUsuario.id || '-' }}</p>
        <p><span class="font-medium text-sky-700">Usuario:</span> {{ infoUsuario.nombre }}</p>
        <p>
          <span class="font-medium text-sky-700">Sucursal:</span>
          {{ infoUsuario.nombre_sucursal || '-' }}
        </p>
        <p><span class="font-medium text-sky-700">Rol:</span> {{ infoUsuario.rol || '-' }}</p>
        <p>
          <span class="font-medium text-sky-700">Creación:</span>
          {{ infoUsuario.fecha_creacion }}
        </p>
        <p>
          <span class="font-medium text-sky-700">Actualización:</span>
          {{ infoUsuario.fecha_actualizacion }}
        </p>
      </div>
    </BaseModal>
  </section>
</template>

<style scoped></style>
