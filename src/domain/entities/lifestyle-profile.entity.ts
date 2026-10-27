// src/domain/entities/lifestyle-profile.entity.ts

export class LifestyleProfileEntity {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public minBudget: number,
        public maxBudget: number,
        public preferredZones: string[],
        public hasPets: boolean,
        public toleratesPets: boolean,
        public isSmoker: boolean,
        public toleratesSmokers: boolean,
        public bio: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {
        this.validateBusinessRules();
    }

    // Lógica de negocio encapsulada para garantizar la validez del estado
    private validateBusinessRules(): void {
        if (this.minBudget < 0 || this.maxBudget <= 0) {
            throw new Error('El presupuesto debe ser un valor positivo.');
        }
        if (this.minBudget > this.maxBudget) {
            throw new Error('El presupuesto mínimo no puede ser mayor al máximo.');
        }
    }
}