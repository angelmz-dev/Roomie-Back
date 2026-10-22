// src/application/ports/token-service.interface.ts

export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export interface ITokenService {
  generateToken(payload: TokenPayload): Promise<string> | string;
  verifyToken?(token: string): Promise<TokenPayload> | TokenPayload;
}
