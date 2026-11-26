// src/infrastructure/repositories/prisma-discovery.repository.ts
import type {
    DiscoveryCandidate,
    IDiscoveryRepository,
} from '../../domain/repositories/discovery.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';
import { prisma } from '../database/prisma.client.js';

export class PrismaDiscoveryRepository implements IDiscoveryRepository {
    public async findCompatibleProfiles(
        currentUserId: string,
        zones: string[],
        maxBudget: number,
        skip: number,
        take: number
    ): Promise<DiscoveryCandidate[]> {
        const profiles = await prisma.lifestyleProfile.findMany({
            where: {
                // 1. No mostrarse a sí mismo
                userId: { not: currentUserId },
                // 2. Coincidencia en al menos una zona de Querétaro
                preferredZones: { hasSome: zones },
                // 3. Presupuesto compatible
                minBudget: { lte: maxBudget },
                // 4. Excluir usuarios a los que el usuario actual ya les dio LIKE o DISLIKE
                user: {
                    receivedInteractions: {
                        none: {
                            fromUserId: currentUserId,
                        },
                    },
                },
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                    },
                },
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });

        return profiles.map((p) => {
            const entity = new LifestyleProfileEntity(
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
                p.avatarUrl,
                p.createdAt,
                p.updatedAt
            );

            return {
                id: entity.id,
                userId: entity.userId,
                fullName: p.user.fullName,
                minBudget: entity.minBudget,
                maxBudget: entity.maxBudget,
                preferredZones: entity.preferredZones,
                hasPets: entity.hasPets,
                toleratesPets: entity.toleratesPets,
                isSmoker: entity.isSmoker,
                toleratesSmokers: entity.toleratesSmokers,
                bio: entity.bio,
                avatarUrl: entity.avatarUrl,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
            };
        });
    }
}
