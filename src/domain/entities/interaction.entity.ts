// src/domain/entities/interaction.entity.ts
export enum InteractionType {
    LIKE = 'LIKE',
    DISLIKE = 'DISLIKE',
}

export class InteractionEntity {
    constructor(
        public readonly id: string,
        public readonly fromUserId: string,
        public readonly toUserId: string,
        public readonly type: InteractionType,
        public readonly createdAt: Date
    ) {
        this.validateBusinessRules();
    }

    private validateBusinessRules(): void {
        if (this.fromUserId === this.toUserId) {
            throw new Error('Un usuario no puede interactuar consigo mismo.');
        }
    }
}

