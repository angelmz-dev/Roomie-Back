// src/application/use-cases/login-user.use-case.ts
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

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ) { }

    public async execute(dto: LoginUserDTO): Promise<LoginResult> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new Error('Credenciales inválidas.');
        }

        const isPasswordValid = await this.passwordHasher.compare(
            dto.passwordText,
            user.passwordHash
        );
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
