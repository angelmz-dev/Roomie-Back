// src/domain/entities/lifestyle-profile.entity.ts
export class LifestyleProfileEntity {
    id;
    userId;
    zonePreference;
    budgetMin;
    budgetMax;
    isSmoker;
    hasPets;
    avatarUrl;
    constructor(id, userId, zonePreference, budgetMin, budgetMax, isSmoker, hasPets, avatarUrl) {
        this.id = id;
        this.userId = userId;
        this.zonePreference = zonePreference;
        this.budgetMin = budgetMin;
        this.budgetMax = budgetMax;
        this.isSmoker = isSmoker;
        this.hasPets = hasPets;
        this.avatarUrl = avatarUrl;
        this.validateBudget();
    }
    // Regla de Dominio: El rango de renta debe tener coherencia matemática y financiera
    validateBudget() {
        if (this.budgetMin < 0 || this.budgetMax < 0) {
            throw new Error('El presupuesto no puede ser un valor negativo.');
        }
        if (this.budgetMin > this.budgetMax) {
            throw new Error('El presupuesto mínimo no puede ser superior al presupuesto máximo.');
        }
    }
}
//# sourceMappingURL=lifestyle-profile.entity.js.map