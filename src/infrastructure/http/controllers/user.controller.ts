// src/infrastructure/http/controllers/user.controller.ts
import type { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case.js';
import type { RegisterUserDTO } from '../../../application/dtos/register-user.dto.js';
import type { LoginUserDTO } from '../../../application/dtos/login-user.dto.js';

export class UserController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase
    ) { }

    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, fullName, password } = req.body;

            // Validación defensiva en la frontera HTTP (Fail-Fast)
            if (!email || !fullName || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Todos los campos (email, fullName, password) son obligatorios.',
                });
                return;
            }

            // Mapeo explícito hacia el DTO de la capa de Aplicación
            const dto: RegisterUserDTO = {
                email,
                fullName,
                passwordText: password,
            };

            const newUser = await this.registerUserUseCase.execute(dto);

            // Respuesta limpia omitiendo el passwordHash por seguridad
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente en RoomieMatch.',
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    fullName: newUser.fullName,
                    createdAt: newUser.createdAt,
                },
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Error inesperado al registrar el usuario.';

            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    };

    // Método para el Login de usuario
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            // 1. Validación defensiva en la frontera HTTP (Fail-Fast)
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: 'El email y la contraseña son obligatorios.',
                });
                return;
            }

            // 2. Mapeo hacia el DTO de la capa de Aplicación
            const dto: LoginUserDTO = {
                email,
                passwordText: password,
            };

            // 3. Ejecución del Caso de Uso
            const response = await this.loginUserUseCase.execute(dto);

            // 4. Respuesta HTTP 200 OK con el Token y datos del usuario
            res.status(200).json({
                success: true,
                message: 'Autenticación exitosa',
                data: response,
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Error en la autenticación';

            res.status(401).json({
                success: false,
                error: errorMessage,
            });
        }
    };
}