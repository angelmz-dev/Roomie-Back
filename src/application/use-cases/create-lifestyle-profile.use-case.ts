// src/application/use-cases/create-lifestyle-profile.use-case.ts
import type { ILifestyleProfileRepository } from '../../domain/repositories/lifestyle-profile.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';
import type { CreateLifestyleProfileDTO } from '../dtos/create-profile.dto.js';
import { randomUUID } from 'crypto';

export class CreateLifestyleProfileUseCase {
    constructor(private readonly profileRepository: ILifestyleProfileRepository) { }

    public async execute(dto: CreateLifestyleProfileDTO): Promise<LifestyleProfileEntity> {
        // 1. Regla de Negocio: Garantizar la relación 1:1
        const existingProfile = await this.profileRepository.findByUserId(dto.userId);
        if (existingProfile) {
            throw new Error('El usuario ya cuenta con un perfil de estilo de vida activo.');
        }

        // 2. Creación de la Entidad Pura (validará internamente que maxBudget > minBudget)
        const newProfile = new LifestyleProfileEntity(
            randomUUID(), // ID temporal, Prisma lo ignorará si delegamos la creación del UUID a la BD, pero es buena práctica en Clean Arch instanciarlo.
            dto.userId,
            dto.minBudget,
            dto.maxBudget,
            dto.preferredZones,
            dto.hasPets,
            dto.toleratesPets,
            dto.isSmoker,
            dto.toleratesSmokers,
            dto.bio || null,
            new Date(),
            new Date()
        );

        // 3. Persistencia mediante el Puerto (Inversión de Dependencias)
        return await this.profileRepository.save(newProfile);
    }
}