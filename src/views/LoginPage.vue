<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usuarioApiLoginUsuario } from '../api/generated'

const router = useRouter()

const nombreUsuario = ref('')
const contrasena = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await usuarioApiLoginUsuario({
      nombre_usuario: nombreUsuario.value,
      contrasena: contrasena.value,
    })

    if (response.status !== 200 || !response.data.success || !response.data.token) {
      errorMessage.value = 'Credenciales inválidas.'
      return
    }

    localStorage.setItem('auth_token', response.data.token)
    localStorage.setItem('user_name', response.data.usuario.nombre_usuario)
    localStorage.setItem('user_role', response.data.usuario.rol || 'usuario')

    await router.push('/')
  } catch (error) {
    errorMessage.value = 'No se pudo iniciar sesión.'
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="colors flex min-h-screen items-center justify-center bg-[var(--bg-100)] px-4">
    <section
      class="w-full max-w-md rounded-xl border border-[var(--bg-300)] bg-white p-6 shadow-sm"
    >
      <header class="mb-5 text-center">
        <h1 class="text-2xl font-bold text-[var(--text-100)]">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-[var(--text-200)]">Accede al sistema de almacén</p>
      </header>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Usuario</label>
          <input
            v-model="nombreUsuario"
            required
            autocomplete="username"
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm text-[var(--text-200)]">Contraseña</label>
          <input
            v-model="contrasena"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-md border border-[var(--bg-300)] px-3 py-2 outline-none focus:border-[var(--primary-100)]"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-md bg-[var(--primary-100)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {{ loading ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped></style>
