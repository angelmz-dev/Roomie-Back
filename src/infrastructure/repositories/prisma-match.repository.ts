// src/infrastructure/repositories/prisma-match.repository.ts
import type { IMatchRepository, MatchWithUserDetails } from '../../domain/repositories/match.repository.interface.js';
import { MatchEntity } from '../../domain/entities/match.entity.js';
import { prisma } from '../database/prisma.client.js';

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

    public async findMatchesByUserId(userId: string): Promise<MatchWithUserDetails[]> {
        const matches = await prisma.match.findMany({
            where: {
                OR: [{ user1Id: userId }, { user2Id: userId }],
            },
            include: {
                user1: { include: { profile: true } },
                user2: { include: { profile: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Mapeamos para devolver siempre los datos del "otro" roomie, no los del usuario actual
        return matches.map((m) => {
            const otherUser = m.user1Id === userId ? m.user2 : m.user1;

            return {
                matchId: m.id,
                createdAt: m.createdAt,
                matchedUser: {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    email: otherUser.email,
                    preferredZones: otherUser.profile?.preferredZones ?? [],
                    maxBudget: otherUser.profile?.maxBudget ?? 0,
                },
            };
        });
    }
}