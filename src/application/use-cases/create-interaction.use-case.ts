// src/application/use-cases/create-interaction.use-case.ts
import type { IInteractionRepository } from '../../domain/repositories/interaction.repository.interface.js';
import type { IMatchRepository } from '../../domain/repositories/match.repository.interface.js';
import { InteractionEntity, InteractionType } from '../../domain/entities/interaction.entity.js';
import type { MatchEntity } from '../../domain/entities/match.entity.js';
import type { CreateInteractionDTO } from '../dtos/create-interaction.dto.js';
import { randomUUID } from 'crypto';

export class CreateInteractionUseCase {
    constructor(
        private readonly interactionRepository: IInteractionRepository,
        private readonly matchRepository: IMatchRepository
    ) { }

    public async execute(dto: CreateInteractionDTO): Promise<{ interaction: InteractionEntity; isMatch: boolean; match?: MatchEntity }> {
        // 1. Regla de Negocio: Validar que no exista una interacción previa para no duplicar datos
        const alreadyInteracted = await this.interactionRepository.exists(dto.fromUserId, dto.toUserId);
        if (alreadyInteracted) {
            throw new Error('Ya has interactuado con este perfil anteriormente.');
        }

        // 2. Crear y guardar la interacción
        const newInteraction = new InteractionEntity(
            randomUUID(),
            dto.fromUserId,
            dto.toUserId,
            dto.type,
            new Date()
        );
        const savedInteraction = await this.interactionRepository.save(newInteraction);

        // 3. Algoritmo de Match: Si es un DISLIKE, el flujo termina aquí.
        if (dto.type === InteractionType.DISLIKE) {
            return { interaction: savedInteraction, isMatch: false };
        }

        // 4. Si es un LIKE, verificamos si hay reciprocidad (Mutual Like)
        // Preguntamos: ¿El 'toUserId' ya le dio LIKE al 'fromUserId'?
        const isMutual = await this.interactionRepository.checkMutualLike(dto.fromUserId, dto.toUserId);

        if (isMutual) {
            // 5. ¡Tenemos un Match! Lo registramos en la base de datos
            const match = await this.matchRepository.create(dto.fromUserId, dto.toUserId);
            return { interaction: savedInteraction, isMatch: true, match };
        }

        // Fue un LIKE, pero aún no es recíproco
        return { interaction: savedInteraction, isMatch: false };
    }
}