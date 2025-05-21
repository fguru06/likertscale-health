import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import HighchartsVue from 'highcharts-vue'

const app = createApp(App)
app.use(HighchartsVue)
app.mount('#app')
