// src/infrastructure/services/bcrypt-password-hasher.service.ts
import bcrypt from 'bcrypt';
import { type IPasswordHasher } from '../../application/ports/password-hasher.interface.js';

export class BcryptPasswordHasher implements IPasswordHasher {
  // 10 rondas es el estándar de la industria para balancear seguridad y rendimiento en Node.js
  private readonly saltRounds: number = 10;

  /**
   * Toma la contraseña en texto plano recibida del frontend y genera el hash seguro.
   */
  public async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

