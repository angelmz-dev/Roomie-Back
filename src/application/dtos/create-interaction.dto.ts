// src/application/dtos/create-interaction.dto.ts
import { InteractionType } from '../../domain/entities/interaction.entity.js';

export interface CreateInteractionDTO {
    fromUserId: string; // Quien da el swipe (Extraído del JWT)
    toUserId: string;   // Quien recibe el swipe
    type: InteractionType;
}

