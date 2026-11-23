// src/application/use-cases/send-chat-message.use-case.ts
import type { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface.js';
import type { IMatchRepository } from '../../domain/repositories/match.repository.interface.js';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity.js';
import type { SendChatMessageDTO } from '../dtos/send-message.dto.js';
import { randomUUID } from 'crypto';

export class SendChatMessageUseCase {
    constructor(
        private readonly chatMessageRepository: IChatMessageRepository,
        private readonly matchRepository: IMatchRepository
    ) { }

    public async execute(dto: SendChatMessageDTO): Promise<ChatMessageEntity> {
        // 1. Verificar que el Match exista
        const match = await this.matchRepository.findById(dto.matchId);
        if (!match) {
            throw new Error('El Match especificado no existe.');
        }

        // 2. Regla de Seguridad Crítica: Verificar que el remitente sea parte de este Match
        const isParticipant = match.user1Id === dto.senderId || match.user2Id === dto.senderId;
        if (!isParticipant) {
            throw new Error('No tienes permiso para enviar mensajes en esta conversación.');
        }

        // 3. Instanciar entidad (valida longitud y contenido no vacío)
        const messageEntity = new ChatMessageEntity(
            randomUUID(),
            dto.matchId,
            dto.senderId,
            dto.content.trim(),
            false,
            new Date()
        );

        // 4. Persistir en PostgreSQL
        return await this.chatMessageRepository.save(messageEntity);
    }
}