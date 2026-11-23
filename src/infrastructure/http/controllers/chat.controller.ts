import type { Request, Response } from 'express';
import { GetChatHistoryUseCase } from '../../../application/use-cases/get-chat-history.use-case.js';

export class ChatController {
    constructor(private readonly getChatHistoryUseCase: GetChatHistoryUseCase) { }

    public getHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const matchId = req.params.matchId;
            if (!matchId || typeof matchId !== 'string') {
                res.status(400).json({ error: 'El parámetro matchId es obligatorio.' });
                return;
            }

            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Usuario no autenticado.' });
                return;
            }

            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

            const messages = await this.getChatHistoryUseCase.execute(matchId, userId, {
                page,
                limit,
            });

            res.status(200).json({ data: messages });
        } catch (error: any) {
            const status = error.message.includes('permiso') ? 403 : 400;
            res.status(status).json({ error: error.message });
        }
    };
}
