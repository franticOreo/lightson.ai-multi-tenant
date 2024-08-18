import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const newSocket = io({
      autoConnect: false,
    });

    function onConnect() {
      console.log('Socket connected');
      setIsConnected(true);
      setTransport(newSocket.io.engine.transport.name);

      newSocket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      console.log('Socket disconnected');
      setIsConnected(false);
      setTransport("N/A");
    }

    function onAnyMessage(event: string, ...args: any[]) {
      console.log(`Received ${event}:`, args);
      setLastMessage({ event, data: args });
    }

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.onAny(onAnyMessage);

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket listener');
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.offAny(onAnyMessage);
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  return { socket, isConnected, transport, lastMessage, sendMessage };
};