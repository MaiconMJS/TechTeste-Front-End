import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '@/views/RegisterView.vue'
import VerifyView from '@/views/VerifyView.vue'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import SendCodeView from '@/views/SendCodeView.vue'
import PasswordUpdateView from '@/views/PasswordUpdateView.vue'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/chatscreen/:userIdDestinatario?/:perfilDestinatario?/:emailDestinatario?',
      name: 'chatscreen',
      component: ChatView
    },
    {
      path: '/password-update/:email?',
      name: 'password-update',
      component: PasswordUpdateView
    },
    {
      path: '/send-code',
      name: 'send-code',
      component: SendCodeView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/verify/:email?',
      name: 'verify',
      component: VerifyView
    },
    {
      path: '/login/:email?',
      name: 'login',
      component: LoginView
    }
  ]
})

export default router
