'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '../socket';


const Onboarding = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [test, setTest] = useState<string>('');


    useEffect(() => {
        if (socket.connected) {
            console.log('Socket connected at Onboarding')
            onConnect();
          }
        
          function onConnect() {
            console.log('Onconnect called')
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
        
            socket.io.engine.on("upgrade", (transport) => {
              setTransport(transport.name);
            });
          }
        
          function onDisconnect() {
            console.log('OnDisconnect called')
            setIsConnected(false);
            setTransport("N/A");
          }
            console.log('Setting up socket listener');
            socket.on('test', (update) => {
            console.log('Received update:', update);
            setTest(update);
        });

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
    
        return () => {
            console.log('Cleaning up socket listener');
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
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