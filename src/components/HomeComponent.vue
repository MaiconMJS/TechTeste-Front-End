<template>
  <div class="flex items-center justify-center min-h-screen bg-black">
    <!-- Verificar se há apenas um usuário logado -->
    <div v-if="users.length === 0" class="text-white text-2xl text-center">
      {{ oneUser }}
    </div>
    <div v-else class="flex flex-wrap justify-center">
      <div
        v-for="(user, index) in users"
        :key="index"
        @click="navigateToChat(user._id, user.perfil, user.email)"
        class="flex items-center m-4 p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-300"
        style="width: 100%; max-width: 300px"
      >
        <!-- Contêiner para imagem e badge com position: relative -->
        <div class="relative">
          <!-- Imagem de perfil redonda à esquerda -->
          <img
            :src="serverHost + user.perfil"
            alt="Foto Perfil"
            class="w-16 h-16 rounded-full object-cover mr-4"
          />

          <!-- Badge de notificação no canto superior direito da foto de perfil -->
          <span
            v-if="newMessage.includes(user._id)"
            class="absolute top-0 left-0 bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
          </span>
        </div>

        <!-- Informações do usuário -->
        <div class="text-left flex-1">
          <!-- Exibir o email do usuário com truncamento se necessário -->
          <div
            class="text-lg font-bold text-white"
            style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          >
            {{ user.email }}
          </div>
        </div>
      </div>
    </div>
    <!-- Áudio para notificação -->
    <audio ref="audioNotificacao" :src="`${serverHost}/notification.ogg`" preload="auto"></audio>
  </div>
</template>

<script>
import socket from '../socket'
import { useAuthStore } from '@/stores/authStore'
import apiPath from '@/apiPath'
export default {
  name: 'HomeComponent',
  setup() {
    const authStore = useAuthStore() // Acessar a store de autenticação
    return { authStore }
  },
  data() {
    return {
      userId: '',
      users: [],
      serverHost: '',
      oneUser: 'Não há usuários logados neste momento!',
      newMessage: [],
      audioInterval: null
    }
  },
  created() {
    this.serverHost = apiPath
    // Carregar ID do cliente logado
    const id = localStorage.getItem('userId')
    if (id) {
      this.userId = id
    }
  },
  mounted() {
    // Salva notificação de mensagens enviadas enquanto o usuário estava offline
    socket.on('notification_from_users', (senderIds) => {
      senderIds.forEach((senderIds) => {
        const getUserId = localStorage.getItem(senderIds)
        // Verifica se já existe um ID de notificação, salva se for diferente
        if (getUserId !== senderIds) {
          localStorage.setItem(senderIds, senderIds)
        }
      })
    })
    // Força o carregamento do áudio quando o componente for montado
    if (this.$refs.audioNotificacao) {
      this.$refs.audioNotificacao.load()
    }

    // Recarregar o áudio periodicamente a cada minuto (60.000ms)
    this.audioInterval = setInterval(() => {
      if (this.$refs.audioNotificacao) {
        this.$refs.audioNotificacao.load()
      }
    }, 60000) // A cada minuto

    // Escuta o evento de receber mensagens
    socket.on('receive_message', ({ fromUserId, message, fromUserEmail, fromUserPerfil }) => {
      this.users.forEach((user) => {
        if (user._id === fromUserId) {
          this.exibirNotificacao(
            'online',
            message,
            `${this.serverHost}${fromUserPerfil}`,
            fromUserEmail
          )
          console.log(`Mensagem de ${fromUserEmail}: ${message}`)
          if (!this.newMessage.includes(user._id)) {
            // Salva no localStorage o id de quem enviou uma mensagem para você
            localStorage.setItem(user._id, user._id)
            // Adiciona na lista newMessage o id de quem enviou um mensagem para você
            this.newMessage.push(user._id)
          }
        }
      })
    })
    // Verifica se o token ainda é válido
    this.verificarToken()
    // Carregar dados do localStorage para garantir que o estado está sincronizado
    this.authStore.loadFromLocalStorage()

    // Observar mudanças no estado de autenticação
    this.$watch(
      () => this.authStore.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          this.iniciarConexaoSocket()
        } else {
          this.$router.push('/login')
        }
      },
      { immediate: true } // Executa o watch imediatamente após o componente ser montado
    )
  },
  methods: {
    // Exibe notificação e exige permissões caso necessário
    exibirNotificacao(info, mensagem, icon, userEmail) {
      if (Notification.permission === 'granted') {
        new Notification(`${info} ${userEmail}`, {
          body: mensagem,
          icon: icon
        })
        // Tocar som de notificação
        this.playNotificationSound()
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(`${info} ${userEmail}`, {
              body: mensagem,
              icon: icon
            })
            this.playNotificationSound()
          }
        })
      }
    },
    playNotificationSound() {
      if (this.$refs.audioNotificacao) {
        this.$refs.audioNotificacao.play().catch((error) => {
          console.log(`Erro ao tocar o áudio de notificação => ${error}`)
        })
      } else {
        console.warn('Elemento de áudio não encontrado.')
      }
    },
    async verificarToken() {
      // Verifica se o token existe antes de fazer a requisição
      try {
        // Faz requisição para a API para verificar se o token do usuário ainda é válido
        await this.$axios.post('user/token', {
          token: 'token'
        })
      } catch (err) {
        if (err.response.status === 401) {
          this.logoutUsuario()
        }
      }
    },
    iniciarConexaoSocket() {
      // Iniciar a conexão de socket e associar o usuário
      socket.emit('associate_user', this.userId)
      socket.on('list_online', (clientes) => {
        const userList = JSON.parse(clientes)
        this.users = userList.filter((idUser) => idUser._id != this.userId)
        // Buscar por ids de notificação para adicionar no newMessage, se o usuário não visualizou e fechou a página ele vai ver o badge marcado
        userList.forEach((user) => {
          const userId = localStorage.getItem(user._id)
          if (user._id === userId) {
            this.newMessage.push(userId)
          }
        })
      })
    },
    logoutUsuario() {
      this.authStore.logout()
      this.$router.push('/login')
    },
    navigateToChat(userIdDestinatario, perfilDestinatario, emailDestinatario) {
      // Remove o usuário da lista de notificações de novas mensagens
      const index = this.newMessage.indexOf(userIdDestinatario)
      if (index > -1) {
        this.newMessage.splice(index, 1) // Remove o ID do usuário da lista
        localStorage.removeItem(userIdDestinatario)
      }
      // Navega para a tela de chat
      this.$router.push({
        name: 'chatscreen',
        params: {
          userIdDestinatario: userIdDestinatario,
          perfilDestinatario: perfilDestinatario,
          emailDestinatario: emailDestinatario
        }
      }) // Passando parâmetros para tela de conversas
    }
  },
  unmounted() {
    socket.off('list_online')
    socket.off('receive_message')
    socket.off('notification_from_users')
    // Limpar o intervalo de áudio para evitar vazamentos de memória
    if (this.audioInterval) {
      clearInterval(this.audioInterval)
    }
  }
}
</script>
