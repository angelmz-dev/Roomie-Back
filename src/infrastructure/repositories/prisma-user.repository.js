import { UserEntity } from '../../domain/entities/user.entity.js';
import { prisma } from '../database/prisma.client.js'; // Asumiendo que ya creaste el Singleton
export class PrismaUserRepository {
    async create(user) {
        // 1. Prisma inserta el registro en PostgreSQL
        const createdPrismaUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                passwordHash: user.passwordHash,
            },
        });
        // 2. Mapeamos el resultado de la DB de vuelta a nuestra Entidad Pura de Dominio
        return this.mapToDomain(createdPrismaUser);
    }
    async findByEmail(email) {
        const prismaUser = await prisma.user.findUnique({
            where: { email },
        });
        if (!prismaUser)
            return null;
        return this.mapToDomain(prismaUser);
    }
    async findById(id) {
        const prismaUser = await prisma.user.findUnique({
            where: { id },
        });
        if (!prismaUser)
            return null;
        return this.mapToDomain(prismaUser);
    }
    /**
     * Helper privado: Aísla el modelo autogenerado de Prisma de nuestro núcleo de negocio.
     * Transforma el objeto de base de datos en una instancia de UserEntity.
     */
    mapToDomain(prismaUser) {
        return new UserEntity(prismaUser.id, prismaUser.email, prismaUser.fullName, prismaUser.passwordHash, prismaUser.createdAt, prismaUser.updatedAt);
    }
}
//# sourceMappingURL=prisma-user.repository.js.map