// src/infrastructure/repositories/prisma-match.repository.ts
import type { IMatchRepository } from '../../domain/repositories/match.repository.interface.js';
import { MatchEntity } from '../../domain/entities/match.entity.js';
import { prisma } from '../database/prisma.client.js';

export class PrismaMatchRepository implements IMatchRepository {
    public async create(user1Id: string, user2Id: string): Promise<MatchEntity> {
        // Para evitar duplicados a nivel lógico, siempre ordenamos los IDs alfabéticamente
        // Esto garantiza que el par (A, B) sea el mismo registro que (B, A)
        const [id1, id2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

        const match = await prisma.match.create({
            data: {
                user1Id: id1,
                user2Id: id2,
            },
        });

        return new MatchEntity(match.id, match.user1Id, match.user2Id, match.createdAt);
    }
}