// src/server.ts
import 'dotenv/config'; // CRÍTICO: Carga .env antes de cualquier importación de Prisma
import http from 'http';
import { app } from './app.js';
import { initializeSocketServer } from './infrastructure/websockets/socket.server.js';

const PORT = process.env.PORT || 3000;

const startServer = (): void => {
  try {
    const httpServer = http.createServer(app);
    initializeSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 RoomieMatch Backend (HTTP + Socket.IO) corriendo en puerto ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (error: unknown) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
