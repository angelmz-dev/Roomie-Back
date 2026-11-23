// src/application/use-cases/get-compatible-profiles.use-case.ts
import type { IDiscoveryRepository } from '../../domain/repositories/discovery.repository.interface.js';
import type { ILifestyleProfileRepository } from '../../domain/repositories/lifestyle-profile.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';
import type { PaginationDTO } from '../dtos/pagination.dto.js';

export class GetCompatibleProfilesUseCase {
    constructor(
        private readonly discoveryRepository: IDiscoveryRepository,
        private readonly profileRepository: ILifestyleProfileRepository // Reutilizamos el puerto del módulo anterior
    ) { }

    public async execute(currentUserId: string, pagination: PaginationDTO): Promise<LifestyleProfileEntity[]> {
        // 1. Obtener el perfil del usuario actual para conocer sus filtros
        const currentProfile = await this.profileRepository.findByUserId(currentUserId);

        if (!currentProfile) {
            throw new Error('Debes completar tu perfil de estilo de vida antes de buscar roomies.');
        }

        // 2. Calcular los valores de paginación (Offset Pagination)
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;

        // 3. Buscar candidatos compatibles delegando la consulta compleja a la infraestructura
        return await this.discoveryRepository.findCompatibleProfiles(
            currentUserId,
            currentProfile.preferredZones,
            currentProfile.maxBudget,
            skip,
            take
        );
    }
}