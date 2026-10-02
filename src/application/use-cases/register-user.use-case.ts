// src/application/use-cases/register-user.use-case.ts
import { UserEntity } from '../../domain/entities/user.entity.js';
import { type IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { type IPasswordHasher } from '../ports/password-hasher.interface.js';
import { type RegisterUserDTO } from '../dtos/register-user.dto.js';

export class RegisterUserUseCase {
    /**
     * Aplicamos Inyección de Dependencias.
     * El caso de uso recibe las abstracciones en su constructor, no las implementaciones concretas.
     */
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher
    ) { }

    public async execute(dto: RegisterUserDTO): Promise<UserEntity> {
        // 1. Regla de Negocio: Verificar si el correo ya existe en Querétaro/RoomieMatch
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // 2. Seguridad: Encriptar la contraseña (delegado al servicio de infraestructura)
        const hashedPassword = await this.passwordHasher.hash(dto.passwordText);

        // 3. Crear la entidad pura de Dominio (Generamos un UUID estándar y fechas actuales)
        const userId = crypto.randomUUID();
        const newUser = new UserEntity(
            userId,
            dto.email,
            dto.fullName,
            hashedPassword,
            new Date(),
            new Date()
        );

        // 4. Persistencia: Guardar el usuario validado en la base de datos a través del repositorio
        return await this.userRepository.create(newUser);
    }
}