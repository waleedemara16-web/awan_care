import { createApp } from 'vue'
import { frappeRequest, setConfig } from 'frappe-ui'
import App from './App.vue'
import router from './router'
import './styles/index.css'

setConfig('resourceFetcher', frappeRequest)

createApp(App).use(router).mount('#awan-vue')
