import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import PedidosPage from '../apps/pedidos/pages/PedidosPage.vue'
import ProductosPage from '../apps/productos/pages/ProductosPage.vue'
import ProveedoresPage from '../apps/proveedores/pages/ProveedoresPage.vue'
import SucursalesPage from '../apps/sucursales/pages/SucursalesPage.vue'
import UsuariosPage from '../apps/usuarios/pages/UsuariosPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/pedidos', name: 'pedidos', component: PedidosPage },
    { path: '/productos', name: 'productos', component: ProductosPage },
    { path: '/proveedores', name: 'proveedores', component: ProveedoresPage },
    { path: '/sucursales', name: 'sucursales', component: SucursalesPage },
    { path: '/usuarios', name: 'usuarios', component: UsuariosPage },
  ],
})

export default router
