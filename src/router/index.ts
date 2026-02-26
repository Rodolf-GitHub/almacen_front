import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import PedidosPage from '../apps/pedidos/pages/PedidosPage.vue'
import PedidosRecibidosPage from '../apps/pedidos/pages/PedidosRecibidosPage.vue'
import ProductosPage from '../apps/productos/pages/ProductosPage.vue'
import ProveedoresPage from '../apps/proveedores/pages/ProveedoresPage.vue'
import SucursalesPage from '../apps/sucursales/pages/SucursalesPage.vue'
import UsuariosPage from '../apps/usuarios/pages/UsuariosPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginPage, meta: { requiresAuth: false } },
    { path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
    {
      path: '/pedidos',
      name: 'pedidos',
      redirect: { name: 'pedidos-realizados' },
      meta: { requiresAuth: true },
    },
    {
      path: '/pedidos/realizados',
      name: 'pedidos-realizados',
      component: PedidosPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/pedidos/recibidos',
      name: 'pedidos-recibidos',
      component: PedidosRecibidosPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/productos',
      name: 'productos',
      component: ProductosPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/proveedores',
      name: 'proveedores',
      component: ProveedoresPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/sucursales',
      name: 'sucursales',
      component: SucursalesPage,
      meta: { requiresAuth: true },
    },
    { path: '/usuarios', name: 'usuarios', component: UsuariosPage, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('auth_token')
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !token) {
    return { name: 'login' }
  }

  if (to.name === 'login' && token) {
    return { name: 'home' }
  }

  return true
})

export default router
