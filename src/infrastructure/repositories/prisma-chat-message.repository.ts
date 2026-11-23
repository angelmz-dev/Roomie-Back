// src/infrastructure/repositories/prisma-chat-message.repository.ts
import { prisma } from '../database/prisma.client.js';
import type { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface.js';
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
        skip: number,
        take: number
    ): Promise<ChatMessageEntity[]> {
        // Traemos los más recientes primero para paginar bien, luego el front (o aquí con .reverse()) los ordena cronológicamente
        const messages = await prisma.chatMessage.findMany({
            where: { matchId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });

        return messages
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
    }
}