// src/domain/repositories/chat-message.repository.interface.ts
import { ChatMessageEntity } from '../entities/chat-message.entity.js';

export interface ChatHistoryCursor {
    before: Date;
    beforeId: string;
}

export interface ChatHistoryQueryOptions {
    skip: number;
    take: number;
    cursor?: ChatHistoryCursor;
}

export interface ChatHistoryPageResult {
    messages: ChatMessageEntity[];
    hasMore: boolean;
}

export interface IChatMessageRepository {
    save(message: ChatMessageEntity): Promise<ChatMessageEntity>;
    findByMatchId(
        matchId: string,
        options: ChatHistoryQueryOptions
    ): Promise<ChatHistoryPageResult>;
}
