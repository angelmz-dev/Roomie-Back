// src/domain/entities/user.entity.ts
export class UserEntity {
    id;
    email;
    fullName;
    passwordHash;
    createdAt;
    updatedAt;
    constructor(id, email, fullName, passwordHash, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.validate();
    }
    // Regla de Dominio: Garantizar que ninguna entidad se cree con datos inválidos en memoria
    validate() {
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
//# sourceMappingURL=user.entity.js.map