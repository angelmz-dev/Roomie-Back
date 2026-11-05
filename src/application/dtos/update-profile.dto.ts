// src/application/dtos/update-profile.dto.ts
export interface UpdateLifestyleProfileDTO {
    userId: string; // Inyectado desde el JWT
    minBudget?: number;
    maxBudget?: number;
    preferredZones?: string[];
    hasPets?: boolean;
    toleratesPets?: boolean;
    isSmoker?: boolean;
    toleratesSmokers?: boolean;
    bio?: string | null;
}