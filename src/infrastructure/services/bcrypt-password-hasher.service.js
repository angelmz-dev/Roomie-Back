// src/infrastructure/services/bcrypt-password-hasher.service.ts
import bcrypt from 'bcrypt';
import {} from '../../application/ports/password-hasher.interface.js';
export class BcryptPasswordHasher {
    // 10 rondas es el estándar de la industria para balancear seguridad y rendimiento en Node.js
    saltRounds = 10;
    /**
     * Toma la contraseña en texto plano recibida del frontend y genera el hash seguro.
     */
    async hash(password) {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return bcrypt.hash(password, salt);
    }
    async compare(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
//# sourceMappingURL=bcrypt-password-hasher.service.js.map