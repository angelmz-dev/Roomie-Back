// src/infrastructure/http/controllers/discovery.controller.ts
import type { Request, Response } from 'express';
import { GetCompatibleProfilesUseCase } from '../../../application/use-cases/get-compatible-profiles.use-case.js';
import type { PaginationDTO } from '../../../application/dtos/pagination.dto.js';

export class DiscoveryController {
    constructor(private readonly getCompatibleProfilesUseCase: GetCompatibleProfilesUseCase) { }

    public getFeed = async (req: Request, res: Response): Promise<void> => {
        try {
            const currentUserId = req.user?.id;

            // Validación de seguridad (Fail-Fast)
            if (!currentUserId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            // Extracción y sanitización de Query Parameters para la paginación
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const pagination: PaginationDTO = {
                page: page > 0 ? page : 1,
                limit: limit > 0 && limit <= 50 ? limit : 10, // Límite máximo de 50 para evitar sobrecarga
            };

            const profiles = await this.getCompatibleProfilesUseCase.execute(currentUserId, pagination);

            res.status(200).json({
                success: true,
                message: 'Feed de discovery generado exitosamente.',
                meta: {
                    page: pagination.page,
                    limit: pagination.limit,
                    returned: profiles.length,
                },
                data: profiles,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al generar el feed de discovery.';
            // Si el error es porque el usuario no tiene su propio perfil creado, es un 400 (Bad Request)
            const statusCode = errorMessage.includes('Debes completar tu perfil') ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
            });
        }
    };
}