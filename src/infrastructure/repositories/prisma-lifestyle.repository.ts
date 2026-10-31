// src/infrastructure/repositories/prisma-lifestyle-profile.repository.ts
import type { ILifestyleProfileRepository } from '../../domain/repositories/lifestyle-profile.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';
import { prisma } from '../database/prisma.client.js';

export class PrismaLifestyleProfileRepository implements ILifestyleProfileRepository {

    public async save(profile: LifestyleProfileEntity): Promise<LifestyleProfileEntity> {
        const savedProfile = await prisma.lifestyleProfile.create({
            data: {
                userId: profile.userId,
                minBudget: profile.minBudget,
                maxBudget: profile.maxBudget,
                preferredZones: profile.preferredZones,
                hasPets: profile.hasPets,
                toleratesPets: profile.toleratesPets,
                isSmoker: profile.isSmoker,
                toleratesSmokers: profile.toleratesSmokers,
                bio: profile.bio,
            },
        });

        return new LifestyleProfileEntity(
            savedProfile.id,
            savedProfile.userId,
            savedProfile.minBudget,
            savedProfile.maxBudget,
            savedProfile.preferredZones,
            savedProfile.hasPets,
            savedProfile.toleratesPets,
            savedProfile.isSmoker,
            savedProfile.toleratesSmokers,
            savedProfile.bio,
            savedProfile.createdAt,
            savedProfile.updatedAt
        );
    }

    public async findByUserId(userId: string): Promise<LifestyleProfileEntity | null> {
        const profile = await prisma.lifestyleProfile.findUnique({
            where: { userId },
        });

        if (!profile) return null;

        return new LifestyleProfileEntity(
            profile.id,
            profile.userId,
            profile.minBudget,
            profile.maxBudget,
            profile.preferredZones,
            profile.hasPets,
            profile.toleratesPets,
            profile.isSmoker,
            profile.toleratesSmokers,
            profile.bio,
            profile.createdAt,
            profile.updatedAt
        );
    }
}