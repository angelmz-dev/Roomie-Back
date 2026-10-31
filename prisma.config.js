import 'dotenv/config'; // Importante para cargar las variables de entorno
import { defineConfig, env } from 'prisma/config'; // Usa 'prisma/config'
export default defineConfig({
    // 1. Ruta al esquema (aunque no definas la URL aquí)
    schema: 'prisma/schema.prisma',
    // 2. Configuración de migraciones (en plural)
    migrations: {
        path: 'prisma/migrations',
    },
    // 3. La URL de la base de datos va aquí
    datasource: {
        url: env('DATABASE_URL'),
    },
});
//# sourceMappingURL=prisma.config.js.map