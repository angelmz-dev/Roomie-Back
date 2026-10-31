import { UserEntity } from '../entities/user.entity.js';
export interface IUserRepository {
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    create(user: UserEntity): Promise<UserEntity>;
}
//# sourceMappingURL=user.repository.interface.d.ts.map