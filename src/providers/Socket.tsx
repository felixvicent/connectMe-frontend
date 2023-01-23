import { createContext, ReactNode, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext({} as SocketContextProps);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const socket = useMemo(() => io("http://192.168.5.103:8001"), []);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
