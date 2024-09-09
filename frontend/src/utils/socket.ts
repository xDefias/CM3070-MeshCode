// src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

const URL: string = `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}`;
const socket: Socket = io(URL, { autoConnect: false });

export default socket;
