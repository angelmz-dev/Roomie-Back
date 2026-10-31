import { type ITokenService, type TokenPayload } from '../../application/ports/token-service.interface.js';
export declare class JwtTokenService implements ITokenService {
    private readonly secretKey;
    private readonly expiresIn;
    constructor();
    generateToken(payload: TokenPayload): string;
    verifyToken(token: string): TokenPayload;
}
//# sourceMappingURL=jwt-token.service.d.ts.map