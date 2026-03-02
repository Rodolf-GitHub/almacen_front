import './assets/main.css'
import 'vue-toastification/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { createToastInterface, POSITION } from 'vue-toastification'

import App from './App.vue'
import router from './router'

const defaultApiBaseUrl = 'https://almacen.api.rodolfogroero.com'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, '')
const nativeFetch = window.fetch.bind(window)
const toast = createToastInterface({
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
})

const getErrorMessageFromResponse = async (response: Response) => {
  try {
    const text = await response.clone().text()
    if (!text) return null

    const parsed = JSON.parse(text) as
      | { detail?: string; message?: string; error?: string }
      | Record<string, unknown>

    if (typeof parsed.detail === 'string' && parsed.detail.trim()) return parsed.detail
    if (typeof parsed.message === 'string' && parsed.message.trim()) return parsed.message
    if (typeof parsed.error === 'string' && parsed.error.trim()) return parsed.error
  } catch {
    return null
  }

  return null
}

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const method = (init?.method || 'GET').toUpperCase()
  const requestUrl =
    typeof input === 'string' && input.startsWith('/api') && apiBaseUrl
      ? `${apiBaseUrl}${input}`
      : input

  const response = await nativeFetch(requestUrl, init)

  if (!response.ok) {
    const urlLabel = typeof input === 'string' ? input : input.toString()
    const message = await getErrorMessageFromResponse(response)
    const description = message || `Error ${response.status} en ${method} ${urlLabel}`
    toast.error(description)
  } else {
    const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
    if (mutatingMethods.has(method)) {
      const successByMethod: Record<string, string> = {
        POST: 'Creado correctamente',
        PUT: 'Actualizado correctamente',
        PATCH: 'Actualizado correctamente',
        DELETE: 'Eliminado correctamente',
      }

      toast.success(successByMethod[method] || 'Operación realizada correctamente', {
        timeout: 1000,
      })
    }
  }

  return response
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
})

app.mount('#app')
