<template>
  <div class="min-h-screen flex items-center justify-center bg-black">
    <div class="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
      <div class="flex justify-center mb-6">
        <img src="@/assets/Logo.jpg" alt="Logo" class="w-140 h-32" />
      </div>
      <h2 class="text-2xl font-bold mb-6 text-center text-white">Altere sua senha!</h2>
      <form @submit.prevent="passwordUpdate">
        <div class="mb-4">
          <label class="block text-white text-sm font-bold mb-2" for="email"> E-mail </label>
          <input
            v-model="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            required
          />
        </div>
        <div class="mb-6 relative">
          <label class="block text-white text-sm font-bold mb-2" for="password">
            Sua nova senha!
          </label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            placeholder="Digite sua nova senha!"
            required
          />
          <label class="block text-white text-sm font-bold mb-2" for="password">
            Códido de autorização!</label
          >
          <input
            v-model="code"
            type="text"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="code"
            placeholder="Digite seu código!"
            required
          />
          <!-- Aqui resposta da API -->
          <h2
            :class="apiResSuccess ? 'text-green-600' : 'text-red-600'"
            class="text-2xl font-bold mb-6 text-center"
          >
            {{ apiRes }}
          </h2>
          <!-- Botão para alternar a visibilidade da senha -->
          <button
            type="button"
            @click="ocultarPassword"
            class="absolute right-3 top-9 text-gray-600 focus:outline-none"
          >
            <span v-if="showPassword">🔒</span>
            <!-- Ícone para ocultar senha -->
            <span v-else>👁️</span>
            <!-- Ícone para mostrar senha -->
          </button>
        </div>
        <div class="flex items-center justify-center">
          <button
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            :disabled="loading"
          >
            <span v-if="loading" class="loader"></span>
            <span v-else>Mudar Senha!</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordUpdateComponent',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false, // Estado para controlar se a senha é visível
      loading: false,
      apiRes: '',
      apiResSuccess: false,
      code: ''
    }
  },
  created() {
    this.email = this.$route.params.email
  },
  methods: {
    ocultarPassword() {
      this.showPassword = !this.showPassword // Alterna entre mostrar ou ocultar a senha
    },
    async passwordUpdate() {
      this.loading = true
      try {
        const response = await this.$axios.post('user/password-update', {
          email: this.email,
          password: this.password,
          code: this.code
        })
        this.apiResSuccess = true
        this.apiRes = response?.data?.Success || 'Ocorreu um erro inesperado!'
        // Adiciona um atraso de 1 segundo antes de redirecionar
        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } catch (err) {
        this.apiResSuccess = false
        this.apiRes = err.response?.data?.Error || 'Ocorreu um erro inesperado!'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
body {
  background-color: #000;
}

.loader {
  border: 4px solid #f3f3f3; /* Cor de fundo do loader */
  border-top: 4px solid #75c915; /* Cor de borda animada */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
