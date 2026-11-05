// src/infrastructure/repositories/prisma-discovery.repository.ts
import type { IDiscoveryRepository } from '../../domain/repositories/discovery.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';
import { prisma } from '../database/prisma.client.js';

export class PrismaDiscoveryRepository implements IDiscoveryRepository {

    public async findCompatibleProfiles(
        currentUserId: string,
        zones: string[],
        maxBudget: number,
        skip: number,
        take: number
    ): Promise<LifestyleProfileEntity[]> {

        // Consulta a PostgreSQL optimizada para Discovery
        const profiles = await prisma.lifestyleProfile.findMany({
            where: {
                // 1. Excluir al usuario actual (no puede hacerse match a sí mismo)
                userId: { not: currentUserId },
                // 2. Intersección de zonas: El candidato debe querer vivir en al menos una de las zonas que busco
                preferredZones: { hasSome: zones },
                // 3. Viabilidad económica: El presupuesto mínimo del candidato debe ser <= a mi máximo
                minBudget: { lte: maxBudget },
            },
            skip,
            take,
            // Ordenamos por los perfiles creados más recientemente
            orderBy: { createdAt: 'desc' },
        });

        // Mapeo hacia la entidad pura de dominio
        return profiles.map(
            (p) =>
                new LifestyleProfileEntity(
                    p.id,
                    p.userId,
                    p.minBudget,
                    p.maxBudget,
                    p.preferredZones,
                    p.hasPets,
                    p.toleratesPets,
                    p.isSmoker,
                    p.toleratesSmokers,
                    p.bio,
                    p.createdAt,
                    p.updatedAt
                )
        );
    }
}