import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let _io: Server;

export function initWs(server: HttpServer) {
  _io = new Server(server, {
    cors: { origin: (process.env.CORS_ORIGINS || '*').split(',').map(s=>s.trim()) }
  });
  _io.on('connection', (socket) => {
    socket.on('join', (room: string) => socket.join(room));
  });
}

export function io() {
  if (!_io) throw new Error('WS not initialized');
  return _io;
}
