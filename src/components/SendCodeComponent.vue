<template>
  <div class="min-h-screen flex items-center justify-center bg-black">
    <div class="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
      <div class="flex justify-center mb-6">
        <img src="@/assets/Logo.jpg" alt="Logo" class="w-140 h-32" />
      </div>
      <h2 class="text-2xl font-bold mb-6 text-center text-white">Solicite Um Código Para Mudar Sua Senha!</h2>
      <form @submit.prevent="enviarSolicitacao">
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
          <!-- Aqui resposta da API -->
          <h2
            :class="apiResSuccess ? 'text-green-600' : 'text-red-600'"
            class="text-2xl font-bold mb-6 text-center"
          >
            {{ apiRes }}
          </h2>
          <!-- Botão para alternar a visibilidade da senha -->
        </div>
        <div class="flex items-center justify-center">
          <button
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            :disabled="loading"
          >
            <span v-if="loading" class="loader"></span>
            <span v-else>Solicitar</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SendCodeComponent',
  data() {
    return {
      email: '',
      loading: false,
      apiRes: '',
      apiResSuccess: false
    }
  },
  methods: {
    async enviarSolicitacao() {
      this.loading = true
      try {
        const response = await this.$axios.post('user/send-code', {
          email: this.email
        })
        this.apiResSuccess = true
        this.apiRes = response?.data?.Success || 'Ocorreu um erro inesperado!'
        // Adiciona um atraso de 3 segundo antes de redirecionar
        setTimeout(() => {
          this.$router.push({ name: 'password-update', params: { email: this.email } })
        }, 3000)
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
