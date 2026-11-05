// src/infrastructure/repositories/prisma-interaction.repository.ts
import type { IInteractionRepository } from '../../domain/repositories/interaction.repository.interface.js';
import { InteractionEntity, InteractionType } from '../../domain/entities/interaction.entity.js';
import { prisma } from '../database/prisma.client.js';


export class PrismaInteractionRepository implements IInteractionRepository {
    public async save(interaction: InteractionEntity): Promise<InteractionEntity> {
        const saved = await prisma.interaction.create({
            data: {
                fromUserId: interaction.fromUserId,
                toUserId: interaction.toUserId,
                type: interaction.type, // LIKE o DISLIKE
            },
        });

        return new InteractionEntity(
            saved.id,
            saved.fromUserId,
            saved.toUserId,
            saved.type as InteractionType,
            saved.createdAt
        );
    }

    public async checkMutualLike(fromUserId: string, toUserId: string): Promise<boolean> {
        // Buscamos si el usuario receptor ya le había dado LIKE al usuario actual
        const mutualLike = await prisma.interaction.findFirst({
            where: {
                fromUserId: toUserId,
                toUserId: fromUserId,
                type: 'LIKE',
            },
        });

        return mutualLike !== null;
    }

    public async exists(fromUserId: string, toUserId: string): Promise<boolean> {
        const existing = await prisma.interaction.findUnique({
            where: {
                fromUserId_toUserId: {
                    fromUserId,
                    toUserId,
                },
            },
        });

        return existing !== null;
    }
}

