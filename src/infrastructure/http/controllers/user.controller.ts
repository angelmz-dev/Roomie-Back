// src/infrastructure/http/controllers/user.controller.ts
import { type Request, type Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case.js';
import { type RegisterUserDTO } from '../../../application/dtos/register-user.dto.js';

export class UserController {
    constructor(private readonly registerUserUseCase: RegisterUserUseCase) { }

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
}