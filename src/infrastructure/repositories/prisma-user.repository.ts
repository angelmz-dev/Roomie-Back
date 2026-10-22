// src/infrastructure/repositories/prisma-user.repository.ts
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
import { prisma } from '../database/prisma.client.js'; // Asumiendo que ya creaste el Singleton

export class PrismaUserRepository implements IUserRepository {

    public async create(user: UserEntity): Promise<UserEntity> {
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

    public async findByEmail(email: string): Promise<UserEntity | null> {
        const prismaUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!prismaUser) return null;
        return this.mapToDomain(prismaUser);
    }

    public async findById(id: string): Promise<UserEntity | null> {
        const prismaUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!prismaUser) return null;
        return this.mapToDomain(prismaUser);
    }

    /**
     * Helper privado: Aísla el modelo autogenerado de Prisma de nuestro núcleo de negocio.
     * Transforma el objeto de base de datos en una instancia de UserEntity.
     */
    private mapToDomain(prismaUser: any): UserEntity {
        return new UserEntity(
            prismaUser.id,
            prismaUser.email,
            prismaUser.fullName,
            prismaUser.passwordHash,
            prismaUser.createdAt,
            prismaUser.updatedAt
        );
    }
}