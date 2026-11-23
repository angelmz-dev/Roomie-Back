// src/app.ts
import dotenv from 'dotenv'; //necesario para cargar las variables de entorno
import express, {} from 'express'; //el compilador exige que ue los tipos puros se importen con la palabra clave type
import cors from 'cors'; //necesario para que el frontend pueda comunicarse con el backend -> npm install --save-dev @types/cors
import { userRoutes } from './infrastructure/http/routes/user.routes.js';
// Cargar variables de entorno (.env)
dotenv.config();
const app = express();
// Middlewares globales de infraestructura
app.use(cors());
app.use(express.json()); // Permite a Express parsear JSON en el body de las peticiones
app.use('/api/users', userRoutes);
// Ruta de diagnóstico básica
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'RoomieMatch API corriendo exitosamente' });
});
export { app };
export default app;
//# sourceMappingURL=app.js.map