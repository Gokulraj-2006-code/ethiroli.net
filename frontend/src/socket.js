
import { io } from 'socket.io-client';

const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();

const SOCKET_URL = configuredSocketUrl
  ? new URL(configuredSocketUrl, window.location.origin).origin
  : import.meta.env.PROD
    ? window.location.origin
    : 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: false
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default socket;
