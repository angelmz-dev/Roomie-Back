// src/domain/entities/user.entity.ts

export class UserEntity {
    constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly fullName: string,
        public readonly passwordHash: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {
        this.validate();
    }

    // Regla de Dominio: Garantizar que ninguna entidad se cree con datos inválidos en memoria
    private validate(): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error('Formato de correo electrónico inválido.');
        }
        if (this.fullName.trim().length < 3) {
            throw new Error('El nombre completo debe contener al menos 3 caracteres.');
        }
        if (this.passwordHash.trim().length === 0) {
            throw new Error('El hash de la contraseña no puede estar vacío.');
        }
        if (this.updatedAt < this.createdAt) {
            throw new Error('La fecha de actualización no puede ser anterior a la de creación.');
        }
    }
}