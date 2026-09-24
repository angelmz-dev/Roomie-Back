// src/domain/repositories/user.repository.interface.ts
import { UserEntity } from '../entities/user.entity.js';

export interface IUserRepository {
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    create(user: UserEntity): Promise<UserEntity>;

    // Próximamente para el sistema de matching en Querétaro:
    // findByZonePreference(zone: string): Promise<UserEntity[]>;
}