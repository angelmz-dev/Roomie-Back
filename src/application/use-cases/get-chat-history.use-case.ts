// src/application/use-cases/get-chat-history.use-case.ts
import type { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface.js';
import type { IMatchRepository } from '../../domain/repositories/match.repository.interface.js';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity.js';
import type { PaginationDTO } from '../dtos/pagination.dto.js';

export class GetChatHistoryUseCase {
    constructor(
        private readonly chatMessageRepository: IChatMessageRepository,
        private readonly matchRepository: IMatchRepository
    ) { }

    public async execute(
        matchId: string,
        requestingUserId: string,
        pagination: PaginationDTO
    ): Promise<ChatMessageEntity[]> {
        const match = await this.matchRepository.findById(matchId);
        if (!match) {
            throw new Error('El Match especificado no existe.');
        }

        // Bloquear lectura si otro usuario ajeno intenta espiar la conversación
        const isParticipant =
            match.user1Id === requestingUserId || match.user2Id === requestingUserId;
        if (!isParticipant) {
            throw new Error('No tienes permiso para consultar esta conversación.');
        }

        const skip = (pagination.page - 1) * pagination.limit;
        return await this.chatMessageRepository.findByMatchId(matchId, skip, pagination.limit);
    }
}