// src/application/use-cases/upload-profile-avatar.use-case.ts
import type { ILifestyleProfileRepository } from '../../domain/repositories/lifestyle-profile.repository.interface.js';
import type { IImageStorageService } from '../ports/image-storage.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';

export class UploadProfileAvatarUseCase {
    constructor(
        private readonly profileRepository: ILifestyleProfileRepository,
        private readonly imageStorageService: IImageStorageService
    ) { }

    public async execute(userId: string, fileBuffer: Buffer): Promise<LifestyleProfileEntity> {
        // 1. Verificar que el perfil del usuario exista
        const existingProfile = await this.profileRepository.findByUserId(userId);
        if (!existingProfile) {
            throw new Error('Debes crear tu perfil de estilo de vida antes de subir una foto.');
        }

        // 2. Subir imagen al proveedor en la nube a través del puerto
        const secureUrl = await this.imageStorageService.uploadImage(
            fileBuffer,
            'roomiematch_qro/avatars'
        );

        // 3. Reconstruir la entidad con el nuevo avatarUrl
        const updatedProfile = new LifestyleProfileEntity(
            existingProfile.id,
            existingProfile.userId,
            existingProfile.minBudget,
            existingProfile.maxBudget,
            existingProfile.preferredZones,
            existingProfile.hasPets,
            existingProfile.toleratesPets,
            existingProfile.isSmoker,
            existingProfile.toleratesSmokers,
            existingProfile.bio,
            secureUrl, // Nueva foto asignada
            existingProfile.createdAt,
            new Date()
        );

        // 4. Persistir en PostgreSQL
        return await this.profileRepository.update(updatedProfile);
    }
}