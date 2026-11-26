// src/domain/repositories/discovery.repository.interface.ts

export interface DiscoveryCandidate {
    id: string;
    userId: string;
    fullName: string;
    minBudget: number;
    maxBudget: number;
    preferredZones: string[];
    hasPets: boolean;
    toleratesPets: boolean;
    isSmoker: boolean;
    toleratesSmokers: boolean;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDiscoveryRepository {
    /**
     * Busca perfiles compatibles excluyendo al usuario actual.
     * @param currentUserId ID del usuario que está buscando.
     * @param zones Zonas de preferencia (ej. ['Juriquilla', 'Centro Histórico']).
     * @param maxBudget Presupuesto máximo del buscador.
     * @param skip Cuántos registros saltar (para paginación).
     * @param take Cuántos registros devolver.
     */
    findCompatibleProfiles(
        currentUserId: string,
        zones: string[],
        maxBudget: number,
        skip: number,
        take: number
    ): Promise<DiscoveryCandidate[]>;
}
