import { app } from './app.js';

const PORT = process.env.PORT || 3000;

const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 RoomieMatch Backend corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();