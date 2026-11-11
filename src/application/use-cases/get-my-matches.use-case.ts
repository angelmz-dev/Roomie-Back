// src/application/use-cases/get-my-matches.use-case.ts
import type { IMatchRepository, MatchWithUserDetails } from '../../domain/repositories/match.repository.interface.js';

export class GetMyMatchesUseCase {
    constructor(private readonly matchRepository: IMatchRepository) { }

    public async execute(userId: string): Promise<MatchWithUserDetails[]> {
        return await this.matchRepository.findMatchesByUserId(userId);
    }
}