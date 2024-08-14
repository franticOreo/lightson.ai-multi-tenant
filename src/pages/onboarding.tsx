'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '../socket';


const Onboarding = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [test, setTest] = useState<string>('');


    useEffect(() => {
      // Connect the socket when the component mounts
      function onConnect() {
          console.log('Socket connected');
          setIsConnected(true);
          setTransport(socket.io.engine.transport.name);

          socket.io.engine.on("upgrade", (transport) => {
              setTransport(transport.name);
          });

          socket.emit('text', 'Message from the client')
      }

      function onDisconnect() {
          console.log('Socket disconnected');
          setIsConnected(false);
          setTransport("N/A");
      }

      function onTest(message: string) {
          console.log('Received test message:', message);
          setTest(message);
      }

      // Properly attach event listeners
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("test", onTest);

      socket.connect()

      // Clean up function
      return () => {
          console.log('Cleaning up socket listener');
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
          socket.off("test", onTest);
          socket.disconnect();
      };
  }, []);

    return (
        <div>
            <h1>Onboarding</h1>
            <div>
                <p>Status: { isConnected ? "connected" : "disconnected" }</p>
                <p>Transport: { transport }</p>
            </div>
            <ul>
                {test}
            </ul>
        </div>
    );
};

export default Onboarding;