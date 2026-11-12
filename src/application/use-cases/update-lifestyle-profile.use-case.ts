// src/application/use-cases/update-lifestyle-profile.use-case.ts
import type { ILifestyleProfileRepository } from '../../domain/repositories/lifestyle-profile.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';
import type { UpdateLifestyleProfileDTO } from '../dtos/update-profile.dto.js';

export class UpdateLifestyleProfileUseCase {
    constructor(private readonly profileRepository: ILifestyleProfileRepository) { }

    public async execute(dto: UpdateLifestyleProfileDTO): Promise<LifestyleProfileEntity> {
        // 1. Verificar que el perfil exista
        const existingProfile = await this.profileRepository.findByUserId(dto.userId);
        if (!existingProfile) {
            throw new Error('Perfil de estilo de vida no encontrado.');
        }

        // 2. Instanciar la entidad actualizada para ejecutar las validaciones de dominio
        const updatedEntity = new LifestyleProfileEntity(
            existingProfile.id,
            existingProfile.userId,
            dto.minBudget ?? existingProfile.minBudget,
            dto.maxBudget ?? existingProfile.maxBudget,
            dto.preferredZones ?? existingProfile.preferredZones,
            dto.hasPets ?? existingProfile.hasPets,
            dto.toleratesPets ?? existingProfile.toleratesPets,
            dto.isSmoker ?? existingProfile.isSmoker,
            dto.toleratesSmokers ?? existingProfile.toleratesSmokers,
            dto.bio !== undefined ? dto.bio : existingProfile.bio,
            dto.avatarUrl !== undefined ? dto.avatarUrl : existingProfile.avatarUrl,
            existingProfile.createdAt,
            new Date()
        );

        // 3. Persistir cambios mediante el puerto
        return await this.profileRepository.update(updatedEntity);
    }
}
