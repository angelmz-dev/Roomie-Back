// src/application/dtos/create-profile.dto.ts
export interface CreateLifestyleProfileDTO {
  userId: string; // Extraído del JWT, no del body por seguridad
  minBudget: number;
  maxBudget: number;
  preferredZones: string[];
  hasPets: boolean;
  toleratesPets: boolean;
  isSmoker: boolean;
  toleratesSmokers: boolean;
  bio?: string;
}
