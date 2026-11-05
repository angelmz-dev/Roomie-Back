// src/application/use-cases/get-my-lifestyle-profile.use-case.ts
import type { ILifestyleProfileRepository } from '../../domain/repositories/lifestyle-profile.repository.interface.js';
import { LifestyleProfileEntity } from '../../domain/entities/lifestyle-profile.entity.js';

export class GetMyLifestyleProfileUseCase {
  constructor(private readonly profileRepository: ILifestyleProfileRepository) { }

  public async execute(userId: string): Promise<LifestyleProfileEntity> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new Error('Perfil de estilo de vida no encontrado.');
    }

    return profile;
  }
}