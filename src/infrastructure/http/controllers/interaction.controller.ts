// src/infrastructure/http/controllers/interaction.controller.ts
import type { Request, Response } from 'express';
import { CreateInteractionUseCase } from '../../../application/use-cases/create-interaction.use-case.js';
import { InteractionType } from '../../../domain/entities/interaction.entity.js';
import type { CreateInteractionDTO } from '../../../application/dtos/create-interaction.dto.js';

export class InteractionController {
    constructor(private readonly createInteractionUseCase: CreateInteractionUseCase) { }

    public swipe = async (req: Request, res: Response): Promise<void> => {
        try {
            const currentUserId = req.user?.id;

            if (!currentUserId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            const { toUserId, type } = req.body;

            // Validación Fail-Fast de datos de entrada
            if (!toUserId || !Object.values(InteractionType).includes(type)) {
                res.status(400).json({
                    success: false,
                    error: 'Faltan parámetros obligatorios o el tipo de interacción es inválido (debe ser LIKE o DISLIKE).',
                });
                return;
            }

            const dto: CreateInteractionDTO = {
                fromUserId: currentUserId,
                toUserId,
                type: type as InteractionType,
            };

            const result = await this.createInteractionUseCase.execute(dto);

            res.status(201).json({
                success: true,
                message: 'Interacción registrada exitosamente.',
                data: {
                    interaction: result.interaction,
                    isMatch: result.isMatch, // Bandera crítica para la UI
                    match: result.match,
                },
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al registrar la interacción.';

            // Si ya existía la interacción (según la regla de negocio), devolvemos 409 Conflict
            const statusCode = errorMessage.includes('Ya has interactuado') ? 409 : 400;

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
            });
        }
    };
}