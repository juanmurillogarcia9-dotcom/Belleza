import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Importaciones obligatorias de Quasar y sus estilos
import {
  Quasar,
  QBanner,
  QBtn,
  QForm,
  QHeader,
  QInput,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QLayout,
  QPage,
  QPageContainer,
  QSelect,
  QTable,
  QToolbar,
  QToolbarTitle,
} from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import './style.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(Quasar, {
  components: {
    QBanner,
    QBtn,
    QForm,
    QHeader,
    QInput,
    QItem,
    QItemLabel,
    QItemSection,
    QList,
    QLayout,
    QPage,
    QPageContainer,
    QSelect,
    QTable,
    QToolbar,
    QToolbarTitle,
  },
  plugins: {},
})

app.mount('#app')