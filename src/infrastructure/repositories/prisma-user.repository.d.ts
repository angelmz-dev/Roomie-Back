import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { UserEntity } from '../../domain/entities/user.entity.js';
export declare class PrismaUserRepository implements IUserRepository {
    create(user: UserEntity): Promise<UserEntity>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    /**
     * Helper privado: Aísla el modelo autogenerado de Prisma de nuestro núcleo de negocio.
     * Transforma el objeto de base de datos en una instancia de UserEntity.
     */
    private mapToDomain;
}
//# sourceMappingURL=prisma-user.repository.d.ts.map