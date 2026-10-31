// src/infrastructure/services/jwt-token.service.ts
import jwt, {} from 'jsonwebtoken';
import {} from '../../application/ports/token-service.interface.js';
export class JwtTokenService {
    secretKey;
    expiresIn;
    constructor() {
        this.secretKey = process.env.JWT_SECRET || 'secret_roomie_match_key';
        this.expiresIn = process.env.JWT_EXPIRES_IN ?? '1h';
    }
    generateToken(payload) {
        return jwt.sign(payload, this.secretKey, {
            expiresIn: this.expiresIn,
        });
    }
    verifyToken(token) {
        return jwt.verify(token, this.secretKey);
    }
}
//# sourceMappingURL=jwt-token.service.js.map