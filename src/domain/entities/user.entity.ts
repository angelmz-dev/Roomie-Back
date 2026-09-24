// src/domain/entities/user.entity.ts
export class UserEntity {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly fullName: string,
        public readonly passwordHash: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    // La capa de dominio encapsula la lógica de negocio pura.
    // Por ejemplo, métodos para verificar reglas específicas del usuario.
}