// src/infrastructure/repositories/prisma-chat-message.repository.ts
import { prisma } from '../database/prisma.client.js';
import type {
    ChatHistoryPageResult,
    ChatHistoryQueryOptions,
    IChatMessageRepository,
} from '../../domain/repositories/chat-message.repository.interface.js';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity.js';

export class PrismaChatMessageRepository implements IChatMessageRepository {
    public async save(message: ChatMessageEntity): Promise<ChatMessageEntity> {
        const saved = await prisma.chatMessage.create({
            data: {
                id: message.id,
                matchId: message.matchId,
                senderId: message.senderId,
                content: message.content,
                isRead: message.isRead,
                createdAt: message.createdAt,
            },
        });

        return new ChatMessageEntity(
            saved.id,
            saved.matchId,
            saved.senderId,
            saved.content,
            saved.isRead,
            saved.createdAt
        );
    }

    public async findByMatchId(
        matchId: string,
        options: ChatHistoryQueryOptions
    ): Promise<ChatHistoryPageResult> {
        const { skip, take, cursor } = options;

        const whereClause = cursor
            ? {
                  matchId,
                  OR: [
                      { createdAt: { lt: cursor.before } },
                      {
                          createdAt: { equals: cursor.before },
                          id: { lt: cursor.beforeId },
                      },
                  ],
              }
            : { matchId };

        // Orden descendente determinista por (createdAt, id) para paginar hacia atrás sin pérdidas
        const rows = await prisma.chatMessage.findMany({
            where: whereClause,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            ...(cursor ? {} : { skip }),
            take: take + 1,
        });

        const hasMore = rows.length > take;
        const pageRows = hasMore ? rows.slice(0, take) : rows;

        const messages = pageRows
            .map(
                (m) =>
                    new ChatMessageEntity(
                        m.id,
                        m.matchId,
                        m.senderId,
                        m.content,
                        m.isRead,
                        m.createdAt
                    )
            )
            .reverse();

        return { messages, hasMore };
    }
}
