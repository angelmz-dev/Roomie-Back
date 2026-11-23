// src/domain/entities/chat-message.entity.ts

export class ChatMessageEntity {
    constructor(
        public readonly id: string,
        public readonly matchId: string,
        public readonly senderId: string,
        public readonly content: string,
        public readonly isRead: boolean,
        public readonly createdAt: Date
    ) {
        this.validateBusinessRules();
    }

    private validateBusinessRules(): void {
        const cleanContent = this.content.trim();
        if (cleanContent.length === 0) {
            throw new Error('El contenido del mensaje no puede estar vacío.');
        }
        if (cleanContent.length > 1000) {
            throw new Error('El mensaje excede el límite máximo de 1000 caracteres.');
        }
    }
}