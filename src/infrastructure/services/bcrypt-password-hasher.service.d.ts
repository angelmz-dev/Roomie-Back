import { type IPasswordHasher } from '../../application/ports/password-hasher.interface.js';
export declare class BcryptPasswordHasher implements IPasswordHasher {
    private readonly saltRounds;
    /**
     * Toma la contraseña en texto plano recibida del frontend y genera el hash seguro.
     */
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}
//# sourceMappingURL=bcrypt-password-hasher.service.d.ts.map