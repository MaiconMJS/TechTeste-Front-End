import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import axiosPath from '@/axiosPath'

// Base URL da api
const axiosInstance = axios.create({
  baseURL: axiosPath
})

// Capturar token do localStorage para passar pelas requisições
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const app = createApp(App)

// Configurar Axios de forma Global
app.config.globalProperties.$axios = axiosInstance

app.use(createPinia())
app.use(router)

app.mount('#app')
