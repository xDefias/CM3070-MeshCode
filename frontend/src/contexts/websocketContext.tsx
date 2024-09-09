// src/contexts/WebSocketContext.tsx
import { createContext, useContext, useEffect, ReactNode, FC } from 'react';
import { useAuth } from './authContext';
import socket from '@/utils/socket';

interface WebSocketProviderProps {
  children: ReactNode;
}

const WebSocketContext = createContext(socket);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children }) => {
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState) return;

    socket.auth = { userId: authState.userId }; // Add userId to socket auth
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [authState]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
