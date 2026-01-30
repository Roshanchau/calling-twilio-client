// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"; // change to your socket server

// we export a singleton socket instance
export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

// Call to connect and register userId once user is known
export function connectSocket(userId: string) {
  if (!socket.connected) socket.connect();

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    if (userId) socket.emit("register", userId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return socket;
}

// safe disconnect
export function disconnectSocket() {
  try {
    socket.disconnect();
  } catch (e) {
    /* ignore */
  }
}