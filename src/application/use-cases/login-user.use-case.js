// src/application/use-cases/login-user.use-case.ts
import {} from '../../domain/repositories/user.repository.interface.js';
import {} from '../ports/password-hasher.interface.js';
import {} from '../ports/token-service.interface.js';
import {} from '../dtos/login-user.dto.js';
export class LoginUserUseCase {
    userRepository;
    passwordHasher;
    tokenService;
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new Error('Credenciales inválidas.');
        }
        const isPasswordValid = await this.passwordHasher.compare(dto.passwordText, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas.');
        }
        const token = await this.tokenService.generateToken({
            userId: user.id,
            email: user.email,
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        };
    }
}
//# sourceMappingURL=login-user.use-case.js.map