import { UserEntity } from '../../domain/entities/user.entity.js';
import { type IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { type IPasswordHasher } from '../ports/password-hasher.interface.js';
import { type RegisterUserDTO } from '../dtos/register-user.dto.js';
export declare class RegisterUserUseCase {
    private readonly userRepository;
    private readonly passwordHasher;
    /**
     * Aplicamos Inyección de Dependencias.
     * El caso de uso recibe las abstracciones en su constructor, no las implementaciones concretas.
     */
    constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher);
    execute(dto: RegisterUserDTO): Promise<UserEntity>;
}
//# sourceMappingURL=register-user.use-case.d.ts.map