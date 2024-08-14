'use client';

import React, { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const Onboarding = () => {
    const { socket, isConnected, transport, lastMessage, sendMessage } = useSocket();

    useEffect(() => {
        if (socket) {
            console.log(socket)
            // socket.connect()
            sendMessage('text', 'Message from the client');
        }
    }, [socket]);

    return (
        <div>
            <h1>Onboarding</h1>
            <div>
                <p>Status: { isConnected ? "connected" : "disconnected" }</p>
                <p>Transport: { transport }</p>
            </div>
            <div>
                <h2>Last Message:</h2>
                <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
            </div>
        </div>
    );
};

export default Onboarding;