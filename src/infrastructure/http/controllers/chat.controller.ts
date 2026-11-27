import type { Request, Response } from 'express';
import { GetChatHistoryUseCase } from '../../../application/use-cases/get-chat-history.use-case.js';
import type { ChatHistoryCursor } from '../../../domain/repositories/chat-message.repository.interface.js';

const MAX_IDENTIFIER_LENGTH = 100;

function extractQueryString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export class ChatController {
    constructor(private readonly getChatHistoryUseCase: GetChatHistoryUseCase) { }

    public getHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const rawMatchId = req.params.matchId;
            if (
                typeof rawMatchId !== 'string' ||
                rawMatchId.trim().length === 0 ||
                rawMatchId.trim().length > MAX_IDENTIFIER_LENGTH
            ) {
                res.status(400).json({
                    success: false,
                    error: 'El parámetro matchId es obligatorio y debe ser válido.',
                });
                return;
            }
            const matchId = rawMatchId.trim();

            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado.',
                });
                return;
            }

            const rawPage = Number(req.query.page);
            const rawLimit = Number(req.query.limit);
            const page =
                Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
            const limit =
                Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 50
                    ? rawLimit
                    : 20;

            const rawBefore = extractQueryString(req.query.before);
            const rawBeforeId = extractQueryString(req.query.beforeId);

            if ((rawBefore && !rawBeforeId) || (!rawBefore && rawBeforeId)) {
                res.status(400).json({
                    success: false,
                    error: 'Los parámetros before y beforeId deben enviarse juntos.',
                });
                return;
            }

            let cursor: ChatHistoryCursor | undefined;
            if (rawBefore && rawBeforeId) {
                const beforeDate = new Date(rawBefore);
                if (
                    Number.isNaN(beforeDate.getTime()) ||
                    rawBeforeId.length > MAX_IDENTIFIER_LENGTH
                ) {
                    res.status(400).json({
                        success: false,
                        error: 'El cursor de paginación (before, beforeId) es inválido.',
                    });
                    return;
                }

                cursor = {
                    before: beforeDate,
                    beforeId: rawBeforeId,
                };
            }

            const { messages, hasMore } = await this.getChatHistoryUseCase.execute(
                matchId,
                userId,
                {
                    page,
                    limit,
                    ...(cursor ? { cursor } : {}),
                }
            );

            res.status(200).json({
                success: true,
                data: messages,
                meta: {
                    page: cursor ? 1 : page,
                    limit,
                    returned: messages.length,
                    hasMore,
                },
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Error al consultar el historial de conversación.';

            const status = errorMessage.includes('permiso')
                ? 403
                : errorMessage.includes('no existe')
                  ? 404
                  : 400;

            res.status(status).json({
                success: false,
                error: errorMessage,
            });
        }
    };
}
