// src/infrastructure/services/jwt-token.service.ts
import jwt, { type SignOptions } from 'jsonwebtoken';
import {
  type ITokenService,
  type TokenPayload,
} from '../../application/ports/token-service.interface.js';
import type { StringValue } from 'ms';

export class JwtTokenService implements ITokenService {
  private readonly secretKey: string;
  private readonly expiresIn: SignOptions['expiresIn'];

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'secret_roomie_match_key';
    this.expiresIn = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) ?? '1h';
  }

  public generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn as StringValue,
    });
  }

  public verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.secretKey) as TokenPayload;
  }
}
