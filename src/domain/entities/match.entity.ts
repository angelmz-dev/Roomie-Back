// src/domain/entities/match.entity.ts
export class MatchEntity {
    constructor(
        public readonly id: string,
        public readonly user1Id: string,
        public readonly user2Id: string,
        public readonly createdAt: Date
    ) { }
}