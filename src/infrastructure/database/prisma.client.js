// src/infrastructure/database/prisma.client.ts
import 'dotenv/config'; // Garantiza que process.env.DATABASE_URL esté disponible antes de instanciar el Pool
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
// Validación temprana (Fail-Fast) para evitar errores silenciosos de conexión
if (!connectionString) {
    throw new Error('❌ [Infraestructura]: La variable de entorno DATABASE_URL no está definida en el archivo .env');
}
/**
 * 1. Configuramos el Pool de conexiones nativo de PostgreSQL (pg).
 * Esto administra múltiples conexiones concurrentes para endpoints HTTP y eventos de Socket.io.
 */
const pool = new pg.Pool({ connectionString });
/**
 * 2. Patrón Adapter: Envolvemos el Pool nativo de 'pg' en el adaptador de Prisma 7.
 */
const adapter = new PrismaPg(pool);
/**
 * 3. Patrón Singleton: Guardamos la instancia en el objeto global de Node.js
 * para evitar agotar las conexiones de Docker cuando 'tsx watch' recargue el servidor.
 */
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        adapter, // <-- Inyectamos el adaptador requerido por Prisma 7
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=prisma.client.js.map