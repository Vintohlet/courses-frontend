import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from './i18n'
import router from './router'
import { onUnauthorized } from './api/client'
import { useAuthStore } from './stores/auth'
import './assets/main.css'
const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.use(router)
onUnauthorized((required) => {
  useAuthStore().clear()
  if (required && router.currentRoute.value.path !== '/login')
    void router.replace({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath, expired: '1' },
    })
})
app.mount('#app')
