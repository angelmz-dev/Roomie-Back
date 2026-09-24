// src/app.ts
import express, { type Application } from 'express'; //el compilador exige que ue los tipos puros se importen con la palabra clave type
import cors from 'cors'; //necesario para que el frontend pueda comunicarse con el backend -> npm install --save-dev @types/cors
import dotenv from 'dotenv'; //necesario para cargar las variables de entorno

// Cargar variables de entorno (.env)
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales de infraestructura
app.use(cors());
app.use(express.json()); // Permite a Express parsear JSON en el body de las peticiones

// Ruta de diagnóstico básica
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'RoomieMatch API corriendo exitosamente' });
});

app.listen(PORT, () => {
    console.log(`Servidor de RoomieMatch inicializado en http://localhost:${PORT}`);
});