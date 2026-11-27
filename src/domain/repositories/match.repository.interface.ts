// src/domain/repositories/match.repository.interface.ts
import { MatchEntity } from '../entities/match.entity.js';

// Estructura optimizada para la bandeja de entrada en React
export interface MatchWithUserDetails {
    matchId: string;
    createdAt: Date;
    matchedUser: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
        minBudget: number | null;
        maxBudget: number | null;
        preferredZones: string[];
        bio: string | null;
    };
}

export interface IMatchRepository {
    create(user1Id: string, user2Id: string): Promise<MatchEntity>;
    // Listar los matches de un usuario
    findMatchesByUserId(userId: string): Promise<MatchWithUserDetails[]>;
    // Validar pertenencia al Match antes de chatear
    findById(matchId: string): Promise<MatchEntity | null>;
}
