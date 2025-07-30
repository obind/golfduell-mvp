import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

console.log('Starting Vue app...')

const app = createApp(App)

console.log('App created, adding router...')
app.use(router)

console.log('Mounting app...')
app.mount('#app')

console.log('App mounted successfully!')

