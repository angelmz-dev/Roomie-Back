import { type IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { type IPasswordHasher } from '../ports/password-hasher.interface.js';
import { type ITokenService } from '../ports/token-service.interface.js';
import { type LoginUserDTO } from '../dtos/login-user.dto.js';
export interface LoginResult {
    token: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
}
export declare class LoginUserUseCase {
    private readonly userRepository;
    private readonly passwordHasher;
    private readonly tokenService;
    constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher, tokenService: ITokenService);
    execute(dto: LoginUserDTO): Promise<LoginResult>;
}
//# sourceMappingURL=login-user.use-case.d.ts.map