// src/infrastructure/http/controllers/match.controller.ts
import type { Request, Response } from 'express';
import { GetMyMatchesUseCase } from '../../../application/use-cases/get-my-matches.use-case.js';

export class MatchController {
    constructor(private readonly getMyMatchesUseCase: GetMyMatchesUseCase) { }

    public getMyMatches = async (req: Request, res: Response): Promise<void> => {
        try {
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            const matches = await this.getMyMatchesUseCase.execute(currentUserId);

            res.status(200).json({
                success: true,
                data: matches,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener los matches.';
            res.status(500).json({ success: false, error: errorMessage });
        }
    };
}