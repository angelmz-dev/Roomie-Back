// src/domain/entities/lifestyle-profile.entity.ts

// Zonas estratégicas de alta demanda estudiantil y laboral en Querétaro
export type QueretaroZone =
    | 'Juriquilla'
    | 'Centro Histórico'
    | 'El Refugio'
    | 'Zibatá'
    | 'Corregidora'
    | 'Milenio III'
    | 'Alamos';

export class LifestyleProfileEntity {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly zonePreference: QueretaroZone,
        public readonly budgetMin: number,
        public readonly budgetMax: number,
        public readonly isSmoker: boolean,
        public readonly hasPets: boolean,
        public readonly avatarUrl?: string
    ) {
        this.validateBudget();
    }

    // Regla de Dominio: El rango de renta debe tener coherencia matemática y financiera
    private validateBudget(): void {
        if (this.budgetMin < 0 || this.budgetMax < 0) {
            throw new Error('El presupuesto no puede ser un valor negativo.');
        }
        if (this.budgetMin > this.budgetMax) {
            throw new Error('El presupuesto mínimo no puede ser superior al presupuesto máximo.');
        }
    }
}