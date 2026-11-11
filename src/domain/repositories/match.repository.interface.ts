// src/domain/repositories/match.repository.interface.ts
import { MatchEntity } from '../entities/match.entity.js';

// Estructura optimizada para la bandeja de entrada en React
export interface MatchWithUserDetails {
    matchId: string;
    createdAt: Date;
    matchedUser: {
        id: string;
        fullName: string;
        email: string;
        preferredZones: string[];
        maxBudget: number;
    };
}

export interface IMatchRepository {
    create(user1Id: string, user2Id: string): Promise<MatchEntity>;
    // Nuevo contrato para listar los matches de un usuario
    findMatchesByUserId(userId: string): Promise<MatchWithUserDetails[]>;
}