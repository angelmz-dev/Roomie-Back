// src/infrastructure/http/controllers/profile.controller.ts
import type { Request, Response } from 'express';
import { CreateLifestyleProfileUseCase } from '../../../application/use-cases/create-lifestyle-profile.use-case.js';
import type { CreateLifestyleProfileDTO } from '../../../application/dtos/create-profile.dto.js';

export class ProfileController {
    constructor(private readonly createProfileUseCase: CreateLifestyleProfileUseCase) { }

    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            // req.user existe gracias a nuestro JwtAuthMiddleware
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            const {
                minBudget,
                maxBudget,
                preferredZones,
                hasPets,
                toleratesPets,
                isSmoker,
                toleratesSmokers,
                bio,
            } = req.body;

            // Validación defensiva (Fail-Fast)
            if (minBudget === undefined || maxBudget === undefined || !preferredZones) {
                res.status(400).json({
                    success: false,
                    error: 'Faltan campos obligatorios: minBudget, maxBudget o preferredZones.',
                });
                return;
            }

            const dto: CreateLifestyleProfileDTO = {
                userId, // Asignado de forma segura desde el Token
                minBudget: Number(minBudget),
                maxBudget: Number(maxBudget),
                preferredZones,
                hasPets: Boolean(hasPets),
                toleratesPets: Boolean(toleratesPets),
                isSmoker: Boolean(isSmoker),
                toleratesSmokers: Boolean(toleratesSmokers),
                bio,
            };

            const newProfile = await this.createProfileUseCase.execute(dto);

            res.status(201).json({
                success: true,
                message: 'Perfil de estilo de vida creado exitosamente.',
                data: newProfile,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear el perfil.';
            // Si el error es la regla de negocio (perfil duplicado), devolvemos un 409 Conflict
            const statusCode = errorMessage.includes('ya cuenta con un perfil') ? 409 : 400;

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
            });
        }
    };
}