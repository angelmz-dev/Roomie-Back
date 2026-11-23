export interface TokenPayload {
    userId: string;
    email: string;
    [key: string]: unknown;
}
export interface ITokenService {
    generateToken(payload: TokenPayload): Promise<string> | string;
    verifyToken?(token: string): Promise<TokenPayload> | TokenPayload;
}
//# sourceMappingURL=token-service.interface.d.ts.map