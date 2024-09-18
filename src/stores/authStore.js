import { defineStore } from 'pinia'

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    isAuthenticated: false, // Estado de autenticação
    userId: null,
    email: null,
    perfil: null
  }),
  actions: {
    // Ação para fazer login e atualizar o estado
    login(userData) {
      this.isAuthenticated = true
      this.userId = userData.userId
      this.email = userData.email
      this.perfil = userData.perfil
    },
    // Ação para deslogar e limpar o estado
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('email')
      localStorage.removeItem('perfil')
      this.isAuthenticated = false
      this.userId = null
      this.email = null
      this.perfil = null
    },
    // Ação para carregar dados do localStorage (ao iniciar a aplicação)
    loadFromLocalStorage() {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const email = localStorage.getItem('email')
      const perfil = localStorage.getItem('perfil')

      if (token && userId && email) {
        this.isAuthenticated = true
        this.userId = userId
        this.email = email
        this.perfil = perfil
      }
    }
  }
})
