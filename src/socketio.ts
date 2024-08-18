import { Server, Socket } from 'socket.io'

let io: Server;
let connectedSockets: { [id: string]: Socket } = {};

export const initIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    connectedSockets[socket.id] = socket;
  
    socket.on('text', (msg) => {
      console.log('message: ' + msg);
    });
  
    socket.emit('test', 'Hello from server');
  
    socket.on('disconnect', () => {
      console.log('user disconnected', socket.id);
      delete connectedSockets[socket.id];
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitToSocket = (socketId: string, event: string, data: any) => {
  const socket = connectedSockets[socketId];
  if (socket) {
    socket.emit(event, data);
  } else {
    console.warn(`Socket with id ${socketId} not found`);
  }
};

export const getAllSocketIds = () => Object.keys(connectedSockets);