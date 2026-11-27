// src/infrastructure/repositories/prisma-match.repository.ts
import type { IMatchRepository, MatchWithUserDetails } from '../../domain/repositories/match.repository.interface.js';
import { MatchEntity } from '../../domain/entities/match.entity.js';
import { prisma } from '../database/prisma.client.js';

const MATCHED_USER_SELECT = {
    id: true,
    fullName: true,
    profile: {
        select: {
            avatarUrl: true,
            minBudget: true,
            maxBudget: true,
            preferredZones: true,
            bio: true,
        },
    },
} as const;

export class PrismaMatchRepository implements IMatchRepository {
    public async create(user1Id: string, user2Id: string): Promise<MatchEntity> {
        // Tupla ternaria para garantizar tipado estricto (evita string | undefined con noUncheckedIndexedAccess)
        const [id1, id2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

        const match = await prisma.match.create({
            data: {
                user1Id: id1,
                user2Id: id2,
            },
        });

        return new MatchEntity(match.id, match.user1Id, match.user2Id, match.createdAt);
    }

    public async findById(matchId: string): Promise<MatchEntity | null> {
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match) return null;

        return new MatchEntity(match.id, match.user1Id, match.user2Id, match.createdAt);
    }

    public async findMatchesByUserId(userId: string): Promise<MatchWithUserDetails[]> {
        const matches = await prisma.match.findMany({
            where: {
                OR: [{ user1Id: userId }, { user2Id: userId }],
            },
            select: {
                id: true,
                user1Id: true,
                createdAt: true,
                user1: { select: MATCHED_USER_SELECT },
                user2: { select: MATCHED_USER_SELECT },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Mapeamos para devolver siempre los datos públicos del "otro" roomie
        return matches.map((m) => {
            const otherUser = m.user1Id === userId ? m.user2 : m.user1;
            const profile = otherUser.profile;

            return {
                matchId: m.id,
                createdAt: m.createdAt,
                matchedUser: {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    avatarUrl: profile?.avatarUrl ?? null,
                    minBudget: profile?.minBudget ?? null,
                    maxBudget: profile?.maxBudget ?? null,
                    preferredZones: profile?.preferredZones ?? [],
                    bio: profile?.bio ?? null,
                },
            };
        });
    }
}
