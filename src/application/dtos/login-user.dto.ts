// src/application/dtos/login-user.dto.ts
export interface LoginUserDTO {
    email: string;
    passwordText: string;
}

// src/application/dtos/login-response.dto.ts
export interface LoginResponseDTO {
    token: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
}

// src/application/ports/token-service.interface.ts
/**
 * Puerto que aísla nuestra aplicación de la librería de JWT.
 * Si mañana cambiamos JWT por otro sistema de tokens, el caso de uso no se modifica.
 */
export interface ITokenService {
    generateToken(payload: Record<string, unknown>, expiresIn?: string): string;
    verifyToken(token: string): Record<string, unknown> | null;
}