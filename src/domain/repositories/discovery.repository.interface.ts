// src/domain/repositories/discovery.repository.interface.ts
import { LifestyleProfileEntity } from '../entities/lifestyle-profile.entity.js';

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
    ): Promise<LifestyleProfileEntity[]>;
}