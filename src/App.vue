<template>
  <div>
    <!-- AppBar -->
    <nav class="bg-green-600 text-white shadow-md fixed top-0 w-full z-50">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center">
          <!-- Substituir imagem de perfil pelo ícone de carregamento -->
          <div class="relative w-20 h-20 rounded-full mr-3">
            <template v-if="isUploading">
              <!-- Spinner de carregamento -->
              <div class="flex items-center justify-center w-full h-full rounded-full bg-gray-300">
                <svg
                  class="animate-spin h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v2m0 12v2m8-8h-2M6 12H4m15.364-4.636l-1.414 1.414M6.343 6.343L4.93 7.757m12.728 10.607l-1.414-1.414M6.343 17.657l-1.414-1.414"
                  />
                </svg>
              </div>
            </template>
            <template v-else>
              <img
                @click="fileInput"
                :src="perfil"
                alt="Logo"
                class="w-20 h-20 rounded-full mr-3 cursor-pointer"
              />
            </template>
          </div>

          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            accept="image/"
            class="hidden"
          />
          <div
            class="text-2xl font-semibold"
            :class="{ 'text-lg': isMobileMenuOpen }"
            style="font-family: 'Indie Flower', cursive"
          >
            <button @click="goHome">TechTeste</button>
            <p class="text-sm text-white ml-1">{{ logado }}</p>
          </div>
        </div>

        <!-- Dropdown Icon Para Mobile Menu -->
        <div class="sm:hidden">
          <button @click="toggleMobileMenu" class="focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        <!-- Links Para Desktop -->
        <div class="hidden sm:flex space-x-4">
          <RouterLink to="/" class="hover:underline font-bold" active-class="active-link"
            >HOME</RouterLink
          >
          <RouterLink to="/register" class="hover:underline font-bold" active-class="active-link"
            >REGISTRAR</RouterLink
          >
          <RouterLink to="/verify" class="hover:underline font-bold" active-class="active-link"
            >VERIFICAR CONTA</RouterLink
          >
          <RouterLink to="/login" class="hover:underline font-bold" active-class="active-link"
            >LOGAR</RouterLink
          >
          <RouterLink to="/send-code" class="hover:underline font-bold" active-class="active-link"
            >SOLICITE CÓDIGO DE AUTORIZAÇÃO</RouterLink
          >
          <RouterLink
            to="/password-update"
            class="hover:underline font-bold"
            active-class="active-link"
            >ATUALIZAR SENHA</RouterLink
          >
        </div>
      </div>

      <!-- Mobile Menu (Dropdown) -->
      <div v-if="isMobileMenuOpen" class="sm:hidden bg-green-700">
        <div class="space-y-2 py-2">
          <RouterLink
            to="/"
            class="block text-white hover:bg-green-500 py-1 px-3 font-bold"
            active-class="active-link"
            >HOME</RouterLink
          >
          <RouterLink
            to="/register"
            class="block text-white hover:bg-green-500 py-1 px-3 font-bold"
            active-class="active-link"
            >REGISTRAR</RouterLink
          >
          <RouterLink
            to="/verify"
            class="block text-white hover:bg-green-500 py-1 px-3 font-bold"
            active-class="active-link"
            >VERIFICAR CONTA</RouterLink
          >
          <RouterLink
            to="/login"
            class="block text-white hover:bg-green-500 py-1 px-3 font-bold"
            active-class="active-link"
            >LOGAR</RouterLink
          >
          <RouterLink
            to="/send-code"
            class="block text-white hover:bg-green-500 py-1 px-3 font-bold"
            active-class="active-link"
            >SOLICITE CÓDIGO DE AUTORIZAÇÃO</RouterLink
          >
          <RouterLink
            to="/password-update"
            class="block text-white hover:bg-green-500 py-1 px-3 font-bold"
            active-class="active-link"
            >ATUALIZAR SENHA</RouterLink
          >
        </div>
      </div>
    </nav>

    <!-- Área do conteúdo -->
    <div class="mt-12 bg-black">
      <router-view v-slot="{ Component }">
        <Transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </div>
    <ErrorModal
      :show="showErrorModal"
      :errorMessage="errorMessage"
      @close="showErrorModal = false"
    />
  </div>
</template>

<script>
// Importa a modal de erro quando o token é inválido ou não existe
import ErrorModal from '@/components/ErrorModal.vue'
// Carrega imagem do TechTeste se o usuário não tiver uma imagem de perfil
import logo from '@/assets/Logo.jpg'
// Importar o Pinia
import { useAuthStore } from '@/stores/authStore'
// Caminho do server
import apiPath from '@/apiPath'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    // Carregar o estado do localStorage na montagem do componente
    authStore.loadFromLocalStorage()
    return { authStore }
  },
  components: {
    ErrorModal
  },
  data() {
    return {
      isMobileMenuOpen: false, // Controlador de estado do Mobile menu
      perfil: '',
      logado: '',
      isUploading: false, // Variável para controlar o estado de carregamento
      showErrorModal: false,
      errorMessage: '',
      apiPath: ''
    }
  },
  mounted() {
    // Carregar dados do localStorage ao montar o aplicativo
    this.authStore.loadFromLocalStorage()
    this.verificarToken()
  },
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated
    },
    userProfile() {
      return this.authStore.perfil ? `${apiPath}${this.authStore.perfil}` : logo
    },
    userEmail() {
      return this.authStore.email || ''
    }
  },
  watch: {
    // Sempre que o estado de perfil mudar, atualizar a imagem de perfil no template
    userProfile(newProfile) {
      this.perfil = newProfile
    },
    // Sempre que o email mudar, atualizar o texto do usuário logado
    userEmail(newEmail) {
      this.logado = newEmail
    }
  },
  methods: {
    async verificarToken() {
      try {
        // Faz requisição para a API para verificar se o token do usuário ainda é válido
        await this.$axios.post('user/token', {
          token: 'token'
        })
      } catch (err) {
        if (err.response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('email')
          localStorage.removeItem('userId')
          localStorage.removeItem('perfil')
          this.$router.push('/login')
          this.authStore.logout()
        }
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    goHome() {
      this.$router.push('/')
      this.isMobileMenuOpen = false
    },
    fileInput() {
      this.$refs.fileInput.click()
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const formData = new FormData()
        formData.append('perfil', file)

        try {
          // Inicia o estado de carregamento
          this.isUploading = true

          // Fazendo requisição com axios
          const response = await this.$axios.post('image/perfil', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })

          // Se o upload foi bem-sucedido
          if (response.status === 200) {
            const result = response.data
            // Atualiza a nova imagem do perfil com a nova URL da API
            this.perfil = `${apiPath}${result.perfil}?t=${new Date().getTime()}` // Força o refresh da imagem no cache
            // Atualiza o estado no authStore
            this.authStore.perfil = result.perfil
            // Salva no localstorage para persistência
            localStorage.setItem('perfil', result.perfil)
          } else {
            console.log('Erro ao enviar a imagem')
          }
        } catch (err) {
          this.errorMessage = err.response?.data?.Error || 'Ocorreu um erro inesperado!'
          this.showErrorModal = true
        } finally {
          // Finaliza o estado de carregamento
          this.isUploading = false
        }
      }
    }
  },
  created() {
    // Verifica se existe um caminho de imagem de perfil no localstorage
    this.perfil = this.userProfile
    this.logado = this.userEmail
    this.apiPath = apiPath
  }
}
</script>

<style scoped>
.active-link {
  background-color: #0a5238; /* Cor de fundo verde claro */
  color: white; /* Texto branco */
  padding: 0.45rem 0.5rem; /* Espaçamento interno */
  border-radius: 0.375rem; /* Borda arredondada */
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
}

.slide-fade-leave-to {
  transform: translateX(-100%);
}
</style>
