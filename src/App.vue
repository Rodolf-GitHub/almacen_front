<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import {
  Menu,
  ShoppingCart,
  Package,
  Truck,
  Building2,
  Users,
  LogOut,
  User,
  UserCircle,
  Boxes,
} from 'lucide-vue-next'

const router = useRouter()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

const userName = ref(localStorage.getItem('user_name') || 'Usuario')
const userRole = ref(localStorage.getItem('user_role') || 'usuario')

const isAdminRole = () => userRole.value === 'admin'

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  router.push('/')
}
</script>

<template>
  <div class="colors min-h-screen bg-[var(--bg-100)]">
    <nav
      class="fixed top-0 z-50 w-full border-b border-[var(--bg-300)] bg-gradient-to-r from-[var(--primary-100)] to-[var(--primary-200)] shadow-md"
    >
      <div class="px-2 py-3 sm:px-3 lg:px-5 lg:pl-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-start rtl:justify-end">
            <button
              type="button"
              class="inline-flex items-center rounded-lg p-2 text-sm text-white/80 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 lg:hidden"
              @click="toggleSidebar"
            >
              <span class="sr-only">Abrir menú lateral</span>
              <Menu :size="24" />
            </button>
            <RouterLink to="/" class="ms-2 flex md:me-24">
              <span
                class="self-center whitespace-nowrap text-lg font-bold text-white sm:text-xl md:text-2xl"
              >
                📦 Almacén
              </span>
            </RouterLink>
          </div>

          <div class="ms-3 flex items-center">
            <div class="relative">
              <button
                type="button"
                class="flex rounded-full bg-white/20 p-1 text-sm transition-all hover:bg-white/30 focus:ring-4 focus:ring-white/30"
                @click="toggleUserMenu"
              >
                <span class="sr-only">Abrir menú de usuario</span>
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-white font-semibold text-[var(--primary-100)]"
                >
                  <User :size="20" />
                </div>
              </button>

              <div
                v-if="userMenuOpen"
                class="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5"
              >
                <div class="py-1">
                  <div class="border-b border-[var(--bg-300)] px-4 py-3">
                    <p class="text-sm font-semibold text-[var(--text-100)]">{{ userName }}</p>
                    <p class="text-xs capitalize text-[var(--text-200)]">{{ userRole }}</p>
                  </div>
                  <button
                    class="flex w-full items-center px-4 py-2 text-sm text-[var(--text-100)] transition-colors hover:bg-[var(--bg-200)]"
                    type="button"
                  >
                    <UserCircle class="mr-3 h-5 w-5 text-[var(--text-200)]" :stroke-width="2" />
                    Mi perfil
                  </button>
                  <hr class="my-1 border-[var(--bg-300)]" />
                  <button
                    class="flex w-full items-center px-4 py-2 text-sm text-[var(--text-100)] transition-colors hover:bg-[var(--bg-200)]"
                    @click="handleLogout"
                  >
                    <LogOut class="mr-3 h-5 w-5" :stroke-width="2" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <aside
      :class="[
        'fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--bg-300)] bg-white pt-20 shadow-lg transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="h-full overflow-y-auto bg-gradient-to-b from-white to-[var(--bg-100)] px-3 pb-4">
        <ul class="space-y-2 font-medium">
          <li>
            <RouterLink
              to="/pedidos"
              class="group flex items-start gap-3 rounded-lg p-3 text-[var(--text-100)] transition-all hover:bg-[var(--primary-100)] hover:text-white"
              active-class="bg-[var(--primary-100)] text-white shadow-md"
              @click="closeSidebarOnMobile"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-100)]/15 text-[var(--primary-100)] group-hover:bg-white/20 group-hover:text-white"
              >
                <ShoppingCart class="h-5 w-5" :stroke-width="2" />
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-semibold">Pedidos</span>
                <span class="text-xs text-[var(--text-200)] group-hover:text-white/80"
                  >Gestión de órdenes</span
                >
              </span>
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/productos"
              class="group flex items-start gap-3 rounded-lg p-3 text-[var(--text-100)] transition-all hover:bg-[var(--accent-100)] hover:text-white"
              active-class="bg-[var(--accent-100)] text-white shadow-md"
              @click="closeSidebarOnMobile"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-100)]/15 text-[var(--accent-200)] group-hover:bg-white/20 group-hover:text-white"
              >
                <Package class="h-5 w-5" :stroke-width="2" />
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-semibold">Productos</span>
                <span class="text-xs text-[var(--text-200)] group-hover:text-white/80"
                  >Catálogo e inventario</span
                >
              </span>
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/proveedores"
              class="group flex items-start gap-3 rounded-lg p-3 text-[var(--text-100)] transition-all hover:bg-[var(--primary-200)] hover:text-white"
              active-class="bg-[var(--primary-200)] text-white shadow-md"
              @click="closeSidebarOnMobile"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-200)]/20 text-[var(--primary-100)] group-hover:bg-white/20 group-hover:text-white"
              >
                <Truck class="h-5 w-5" :stroke-width="2" />
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-semibold">Proveedores</span>
                <span class="text-xs text-[var(--text-200)] group-hover:text-white/80"
                  >Compras y abastecimiento</span
                >
              </span>
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/sucursales"
              class="group flex items-start gap-3 rounded-lg p-3 text-[var(--text-100)] transition-all hover:bg-[var(--primary-200)] hover:text-white"
              active-class="bg-[var(--primary-200)] text-white shadow-md"
              @click="closeSidebarOnMobile"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-200)]/20 text-[var(--primary-100)] group-hover:bg-white/20 group-hover:text-white"
              >
                <Building2 class="h-5 w-5" :stroke-width="2" />
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-semibold">Sucursales</span>
                <span class="text-xs text-[var(--text-200)] group-hover:text-white/80"
                  >Stock por sucursal</span
                >
              </span>
            </RouterLink>
          </li>

          <li v-if="isAdminRole()">
            <RouterLink
              to="/usuarios"
              class="group flex items-start gap-3 rounded-lg p-3 text-[var(--text-100)] transition-all hover:bg-[var(--primary-100)] hover:text-white"
              active-class="bg-[var(--primary-100)] text-white shadow-md"
              @click="closeSidebarOnMobile"
            >
              <span
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-100)]/15 text-[var(--primary-100)] group-hover:bg-white/20 group-hover:text-white"
              >
                <Users class="h-5 w-5" :stroke-width="2" />
              </span>
              <span class="flex flex-col">
                <span class="text-sm font-semibold">Usuarios</span>
                <span class="text-xs text-[var(--text-200)] group-hover:text-white/80"
                  >Accesos y permisos</span
                >
              </span>
            </RouterLink>
          </li>
        </ul>

        <div class="mt-6 border-t border-[var(--bg-300)] pt-4">
          <RouterLink
            to="/"
            class="group flex items-start gap-3 rounded-lg p-3 text-[var(--text-100)] transition-all hover:bg-[var(--bg-200)] hover:text-[var(--primary-100)]"
            active-class="bg-[var(--bg-200)] text-[var(--primary-100)] shadow-sm"
            @click="closeSidebarOnMobile"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-200)] text-[var(--text-200)] group-hover:bg-white group-hover:text-[var(--primary-100)]"
            >
              <Boxes class="h-5 w-5" :stroke-width="2" />
            </span>
            <span class="flex flex-col">
              <span class="text-sm font-semibold">Inicio</span>
              <span class="text-xs text-[var(--text-200)] group-hover:text-[var(--primary-100)]"
                >Resumen general</span
              >
            </span>
          </RouterLink>
        </div>
      </div>
    </aside>

    <div class="mt-14 p-1 sm:p-2 lg:ml-64 lg:p-4">
      <div class="rounded-lg p-1 sm:p-2 lg:p-4">
        <RouterView />
      </div>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-[var(--text-100)]/50 lg:hidden"
      @click="toggleSidebar"
    ></div>
    <div v-if="userMenuOpen" class="fixed inset-0 z-40" @click="toggleUserMenu"></div>
  </div>
</template>

<style scoped></style>
