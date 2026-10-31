// src/app.ts
import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { userRoutes } from './infrastructure/http/routes/user.routes.js';
import { profileRoutes } from './infrastructure/http/routes/profile.routes.js';

const app: Application = express();

// 1. Middlewares globales de seguridad y parseo
app.use(cors());
app.use(express.json());

// 2. Rutas de la API (Inyección de nuestros módulos)
app.use('/api/users', userRoutes);

app.use('/api/profiles', profileRoutes);
// 3. Health Check para verificar el estado del backend
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'RoomieMatch API - Querétaro',
    timestamp: new Date().toISOString(),
  });
});

export { app };
export default app;

