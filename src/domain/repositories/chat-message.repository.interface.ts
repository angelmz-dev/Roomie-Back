// 2. Nuevo archivo: src/domain/repositories/chat-message.repository.interface.ts
import { ChatMessageEntity } from '../entities/chat-message.entity.js';

export interface IChatMessageRepository {
    save(message: ChatMessageEntity): Promise<ChatMessageEntity>;
    findByMatchId(matchId: string, skip: number, take: number): Promise<ChatMessageEntity[]>;
}