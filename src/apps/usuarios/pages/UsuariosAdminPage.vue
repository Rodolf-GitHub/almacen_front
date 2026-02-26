<script setup lang="ts">
import { PlusCircle, Settings2, Users } from 'lucide-vue-next'
</script>

<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-2xl font-bold text-[var(--text-100)]">Administración de usuarios</h1>
      <p class="text-sm text-[var(--text-200)]">
        Centro de rutas para creación y gestión de cuentas.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <RouterLink
        to="/usuarios/gestion"
        class="group rounded-xl border border-sky-200 bg-white p-4 shadow-sm transition-all hover:bg-sky-50"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700"
          >
            <Settings2 :size="18" />
          </span>
          <div>
            <h2 class="text-base font-semibold text-sky-900">Gestión de usuarios</h2>
            <p class="text-sm text-sky-700">
              Lista, consulta y administra los usuarios del sistema.
            </p>
          </div>
        </div>
      </RouterLink>

      <RouterLink
        to="/usuarios/crear"
        class="group rounded-xl border border-sky-200 bg-white p-4 shadow-sm transition-all hover:bg-sky-50"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700"
          >
            <PlusCircle :size="18" />
          </span>
          <div>
            <h2 class="text-base font-semibold text-sky-900">Crear usuario</h2>
            <p class="text-sm text-sky-700">Abre el formulario para registrar una nueva cuenta.</p>
          </div>
        </div>
      </RouterLink>
    </div>

    <div class="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
      <Users :size="16" class="text-sky-700" />
      <p class="text-sm text-sky-800">Rutas disponibles: gestión y creación de usuarios.</p>
    </div>
  </section>
</template>

<style scoped></style>
