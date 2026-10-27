// src/domain/repositories/lifestyle-profile.repository.interface.ts
import type { LifestyleProfileEntity } from '../entities/lifestyle-profile.entity.js';

export interface ILifestyleProfileRepository {
    save(profile: LifestyleProfileEntity): Promise<LifestyleProfileEntity>;
    findByUserId(userId: string): Promise<LifestyleProfileEntity | null>;
}
