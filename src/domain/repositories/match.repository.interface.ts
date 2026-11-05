// src/domain/repositories/match.repository.interface.ts
import type { MatchEntity } from '../entities/match.entity.js';

export interface IMatchRepository {
    create(user1Id: string, user2Id: string): Promise<MatchEntity>;
}