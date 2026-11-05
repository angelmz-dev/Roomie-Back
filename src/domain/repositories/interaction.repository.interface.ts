// src/domain/repositories/interaction.repository.interface.ts
import { InteractionEntity, InteractionType } from '../entities/interaction.entity.js';

export interface IInteractionRepository {
    // Guarda el LIKE o DISLIKE
    save(interaction: InteractionEntity): Promise<InteractionEntity>;

    // Verifica si el usuario receptor ya le había dado LIKE al usuario actual
    checkMutualLike(fromUserId: string, toUserId: string): Promise<boolean>;

    // Evita que un usuario evalúe a la misma persona dos veces
    exists(fromUserId: string, toUserId: string): Promise<boolean>;
}

