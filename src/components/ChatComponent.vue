<template>
  <div class="flex flex-col items-center min-h-screen bg-gray-900">
    <!-- Appbar -->
    <div
      class="w-full fixed bg-gray-950 p-4 flex justify-between items-center shadow-md max-w-lg md:max-w-xl mx-auto mt-[3.5rem]"
    >
      <div class="flex items-center space-x-4">
        <!-- Profile Image do Destinatário -->
        <img class="w-12 h-12 rounded-full" :src="localhost + perfilDestinatario" alt="Profile" />
        <!-- Email do Destinatário -->
        <span
          style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          class="text-xl font-semibold text-white"
          >{{ emailDestinatario }}</span
        >
      </div>

      <!-- Ponto verde ou vermelho piscando que mostra se o usuário está logado ou não -->
      <div class="flex flex-col items-center">
        <div
          :class="[
            'w-3 h-3 bg-green-500 rounded-full animate-pulse',
            userOffline ? 'bg-red-500' : 'bg-green-500'
          ]"
        ></div>
        <small class="text-white">{{ userOffline ? 'offline' : 'online' }}</small>
      </div>
    </div>

    <!-- Seção de Mensagens -->
    <div
      v-show="mensagens.length >= 1"
      ref="messageContainer"
      class="message-container bg-gray-800 w-full p-6 rounded-lg shadow-md mt-[135px] max-w-lg md:max-w-xl mx-auto flex-1 overflow-y:auto h-full"
      :style="{ 'padding-bottom': '6rem' }"
    >
      <div v-for="(mensagem, index) in mensagens" :key="index">
        <!-- Mensagem do Remetente -->
        <div
          v-if="mensagem.fromUserId === userIdRemetente"
          class="flex items-center justify-start mb-4"
        >
          <img
            class="w-12 h-12 rounded-full object-cover mr-4"
            :src="localhost + perfilRemetente"
            alt="Profile Remetente"
          />
          <div class="text-white">
            <p class="font-bold break-words underline mb-1">{{ emailRemetente }}</p>
            <p class="break-words">{{ mensagem.message }}</p>
            <small class="text-gray-400">{{ formatDate(mensagem.timestamp) }}</small>
          </div>
        </div>

        <!-- Mensagem do Destinatário -->
        <div v-else class="flex items-center justify-end mb-4">
          <div class="text-white text-right">
            <p class="font-bold break-words underline mb-1">{{ emailDestinatario }}</p>
            <p class="break-words">{{ mensagem.message }}</p>
            <small class="text-gray-400">{{ formatDate(mensagem.timestamp) }}</small>
          </div>
          <img
            class="w-12 h-12 rounded-full object-cover ml-4"
            :src="localhost + perfilDestinatario"
            alt="Profile Destinatário"
          />
        </div>
      </div>
    </div>
    <!-- Textarea de Mensagem -->
    <div
      class="fixed bottom-0 w-full bg-gray-950/0 p-4 flex items-center justify-between max-w-lg md:max-w-xl mx-auto z-10"
    >
      <textarea
        v-model="novaMensagem"
        placeholder="Digite sua mensagem aqui!"
        class="w-full p-2 rounded-lg bg-gray-950/30 text-white mr-4 resize-none focus:outline-none"
        rows="1"
        @input="ajustarAlturaTextarea"
        @keyup.enter="enviarMensagem"
        ref="textarea"
      ></textarea>
      <button
        @click="enviarMensagem"
        class="bg-green-600/30 text-white px-4 py-2 rounded-lg hover:bg-green-700/70"
      >
        Enviar
      </button>
    </div>
    <!-- Áudio para notificação -->
    <audio ref="audioNotificacao" :src="`${localhost}/notification.ogg`" preload="auto"></audio>
  </div>
</template>

<script>
import socket from '@/socket'
import apiPath from '@/apiPath'
export default {
  name: 'ChatComponent',
  mounted() {
    this.$nextTick(() => {
      this.scrollToEnd() // Certifique-se de que o DOM está completamente renderizado antes de rolar para o final
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
    socket.on(
      'receive_message',
      ({ fromUserId, message, fromUserEmail, fromUserPerfil, timestamp }) => {
        if (this.userIdDestinatario === fromUserId) {
          this.mensagens.push({
            fromUserId,
            message,
            fromUserEmail,
            fromUserPerfil,
            timestamp
          })
        }
        // Armazena o ID para mostrar a notificação de nova mensagem na tela homeComponent
        localStorage.setItem(fromUserId, fromUserId)
        this.exibirNotificacao(
          'online',
          message,
          `${this.localhost}${fromUserPerfil}`,
          fromUserEmail
        )
        this.scrollToEnd() // Rola para o final após receber nova mensagem
      }
    )
    // Buscar histórico de mensagens no banco de dados
    socket.emit('get_messages', { toUserId: this.userIdDestinatario }, (messages) => {
      this.mensagens = messages
      this.scrollToEnd() // Rola para o final ao carregar o histórico
    })
    socket.on('offline_user', ({ toUserEmail, toUserPerfil }) => {
      this.exibirNotificacao(
        'offline',
        'Cliente Desconectado!',
        `${this.localhost}${toUserPerfil}`,
        toUserEmail
      )
    })
    // Monitora a desconexão do usuário e muda a cor do ponto para vermelho montrando que o cliente está desconectado
    socket.on('user_offline', (userIdOffline) => {
      if (this.userIdDestinatario === userIdOffline) {
        // Muda o ponto verde para vermelho
        this.userOffline = true
      }
    })
    // Monitora a conexão do usuário e muda a cor do ponto para verde monstrando que o cliente está online
    socket.on('online_user', (userIdOnline) => {
      if (this.userIdDestinatario === userIdOnline) {
        // Muda o ponto de vermelho para verde
        this.userOffline = false
      }
    })
  },
  data() {
    return {
      // Caminho servidor local
      localhost: '',
      // Aqui o ID do destinatário
      userIdDestinatario: '',
      // E-mail do destinatário
      emailDestinatario: '',
      // Imagem de perfil do destinatário
      perfilDestinatario: '',
      // Imagem de perfil do remetente
      perfilRemetente: '',
      emailRemetente: '',
      userIdRemetente: '',
      mensagens: [],
      // Nova mensagem
      novaMensagem: '',
      audioInterval: null,
      userOffline: false
    }
  },
  created() {
    this.localhost = apiPath
    // Carrega os dados do destinatário enviado pelo router
    this.userIdDestinatario = this.$route.params.userIdDestinatario
    this.perfilDestinatario = this.$route.params.perfilDestinatario
    this.emailDestinatario = this.$route.params.emailDestinatario

    // Carrega ID, imagem e o E-mail do remetente
    const perfilRemetente = localStorage.getItem('perfil')
    const emailRemetente = localStorage.getItem('email')
    const userIdRemetente = localStorage.getItem('userId')
    if (userIdRemetente) {
      this.userIdRemetente = userIdRemetente
    }
    if (perfilRemetente) {
      this.perfilRemetente = perfilRemetente
    }
    if (emailRemetente) {
      this.emailRemetente = emailRemetente
    }
  },
  methods: {
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
    enviarMensagem() {
      // Verifica se o campo não é vazio para enviar a mensagem
      if (this.novaMensagem.trim() !== '') {
        const mensagem = this.novaMensagem

        // Emite o evento para o servidor com os dados corretos
        socket.emit('send_message', {
          toUserId: this.userIdDestinatario,
          message: mensagem
        })
        // Adiciona a mensagem localmente enviada
        this.mensagens.push({
          fromUserId: this.userIdRemetente,
          toUserId: this.userIdDestinatario,
          message: mensagem,
          timestamp: new Date()
        })

        this.novaMensagem = '' // Limpa o texto após enviar a mensagem
        this.ajustarAlturaTextarea() // Reseta a altura do textarea
        this.scrollToEnd() // Rola para o final após enviar a mensagem
      }
    },
    ajustarAlturaTextarea() {
      const textarea = this.$refs.textarea
      textarea.style.height = 'auto' // Reseta a altura para calcular corretamente
      textarea.style.height = textarea.scrollHeight + 'px' // Define a nova altura com base no conteúdo
    },
    formatDate(date) {
      const options = { hour: '2-digit', minute: '2-digit' }
      return new Date(date).toLocaleTimeString([], options)
    },
    scrollToEnd() {
      this.$nextTick(() => {
        setTimeout(() => {
          const container = this.$refs.messageContainer
          if (container) {
            container.scrollTop = container.scrollHeight
          }
        }, 100) // Pequeno atraso para garantir que o layout seja recalculado
      })
    }
  },
  unmounted() {
    // Finaliza o evento na destruição do componente
    socket.off('receive_message')
    socket.off('offline_user')
    socket.off('user_offline')
    socket.off('online_user')
    // Limpar o intervalo de áudio para evitar vazamentos de memória
    if (this.audioInterval) {
      clearInterval(this.audioInterval)
    }
  }
}
</script>

<style scoped>
.message-container {
  overflow-y: auto;
  max-height: calc(100vh - 120px); /* Ajuste conforme o layout da sua página */
  height: 100%; /* Garante que a altura seja preenchida */
}
</style>
