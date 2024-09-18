import { io } from 'socket.io-client'
import socketPath from '@/socketPath'

// Definindo URL do servidor
const socket = io(socketPath)
export default socket
