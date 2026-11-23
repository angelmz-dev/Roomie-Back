// src/infrastructure/http/middlewares/jwt-auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../services/jwt-token.service.js';

// 1. Extendemos la interfaz de Express para tipar req.user globalmente
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}

const tokenService = new JwtTokenService();

export const jwtAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    // Validación defensiva (Fail-Fast): verifica existencia y formato
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'Acceso no autorizado: Token no proporcionado o formato inválido.',
        });
        return;
    }

    // Dividimos de forma segura
    const parts = authHeader.split(' ');
    const token = parts[1];

    // Garantizamos ante TypeScript y en runtime que el token existe
    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Acceso no autorizado: Token malformado.',
        });
        return;
    }

    try {
        const payload = tokenService.verifyToken(token);

        // Asignamos el usuario a la petición para los controladores subsecuentes
        req.user = {
            id: payload.userId,
            email: payload.email,
        };

        next();
    } catch (_error: unknown) {
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado.',
        });
    }
};
