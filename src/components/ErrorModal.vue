<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Modal background -->
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50"></div>

    <!-- Modal content -->
    <div class="bg-white p-5 rounded-lg shadow-lg z-10">
      <h2 class="text-lg font-bold mb-4">Erro</h2>
      <p>{{ errorMessage }}</p>
      <div class="mt-4 text-right">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      localStorage.removeItem('userId')
      localStorage.removeItem('perfil')
      this.$router.push('/login')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }
}
</script>
