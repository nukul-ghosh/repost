import { io } from 'socket.io-client'

let socket = null

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false
    })
    
    socket.connect()
    socket.emit('join', userId)
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
  }
  
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

export default {
  initSocket,
  disconnectSocket,
  getSocket
}
