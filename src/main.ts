import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const nativeFetch = window.fetch.bind(window)

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string' && input.startsWith('/api') && apiBaseUrl) {
    return nativeFetch(`${apiBaseUrl}${input}`, init)
  }

  return nativeFetch(input, init)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
