export type QueretaroZone = 'Juriquilla' | 'Centro Histórico' | 'El Refugio' | 'Zibatá' | 'Corregidora' | 'Milenio III' | 'Alamos';
export declare class LifestyleProfileEntity {
    readonly id: string;
    readonly userId: string;
    readonly zonePreference: QueretaroZone;
    readonly budgetMin: number;
    readonly budgetMax: number;
    readonly isSmoker: boolean;
    readonly hasPets: boolean;
    readonly avatarUrl?: string | undefined;
    constructor(id: string, userId: string, zonePreference: QueretaroZone, budgetMin: number, budgetMax: number, isSmoker: boolean, hasPets: boolean, avatarUrl?: string | undefined);
    private validateBudget;
}
//# sourceMappingURL=lifestyle-profile.entity.d.ts.map