import type { IncomingMessage, Server as HttpServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import { JwtTokenService } from '../services/jwt-token.service.js';
import { PrismaChatMessageRepository } from '../repositories/prisma-chat-message.repository.js';
import { PrismaMatchRepository } from '../repositories/prisma-match.repository.js';
import { SendChatMessageUseCase } from '../../application/use-cases/send-chat-message.use-case.js';
import type { ChatMessageEntity } from '../../domain/entities/chat-message.entity.js';

const MAX_TIMEOUT_MS = 2_147_483_647;
const MAX_IDENTIFIER_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;

type SocketErrorCode =
    | 'TOKEN_EXPIRED'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INVALID_PAYLOAD'
    | 'STALE_OPERATION'
    | 'SEND_FAILED';

type SocketAckResponse<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; code: SocketErrorCode };

interface AuthenticatedSocket extends Socket {
    userId?: string;
    tokenExpMs?: number;
    activeMatchId?: string | null;
    roomOpVersion?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeOrigin(origin: string): string {
    return origin.trim().replace(/\/+$/, '');
}

function resolveAllowedOrigins(): string[] {
    const rawEnv = process.env.FRONTEND_URL?.trim();
    const isProduction = process.env.NODE_ENV === 'production';

    if (rawEnv && rawEnv.length > 0) {
        const entries = rawEnv
            .split(',')
            .map(normalizeOrigin)
            .filter((entry) => entry.length > 0);

        if (entries.includes('*')) {
            if (isProduction) {
                throw new Error(
                    'FRONTEND_URL no puede utilizar wildcard (*) en producción.'
                );
            }
        }

        const validOrigins = entries.filter((entry) => {
            if (entry === '*') return false;
            try {
                const parsed = new URL(entry);
                return parsed.protocol === 'http:' || parsed.protocol === 'https:';
            } catch {
                return false;
            }
        });

        if (validOrigins.length > 0) {
            return validOrigins;
        }

        if (isProduction) {
            throw new Error(
                'FRONTEND_URL no contiene orígenes HTTP/HTTPS válidos en producción.'
            );
        }
    }

    if (isProduction) {
        throw new Error(
            'La variable de entorno FRONTEND_URL es obligatoria en producción para Socket.IO.'
        );
    }

    return ['http://localhost:5173'];
}

function safeAck<T>(ack: unknown, response: SocketAckResponse<T>): void {
    if (typeof ack === 'function') {
        try {
            (ack as (payload: SocketAckResponse<T>) => void)(response);
        } catch {
            // Ignore errors thrown by malformed client callbacks
        }
    }
}

function extractMatchId(raw: unknown): string | null {
    if (typeof raw !== 'string') {
        return null;
    }

    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_IDENTIFIER_LENGTH) {
        return null;
    }

    return trimmed;
}

function extractHandshakeToken(socket: Socket): string | null {
    const authPayload: unknown = socket.handshake.auth;
    if (isRecord(authPayload) && typeof authPayload.token === 'string') {
        const trimmed = authPayload.token.trim();
        if (trimmed.length > 0) {
            return trimmed;
        }
    }

    const authHeader = socket.handshake.headers.authorization;
    if (typeof authHeader === 'string') {
        const trimmed = authHeader.trim();
        if (trimmed.toLowerCase().startsWith('bearer ')) {
            const token = trimmed.slice(7).trim();
            if (token.length > 0) {
                return token;
            }
        }
    }

    return null;
}

export const initializeSocketServer = (httpServer: HttpServer): SocketIOServer => {
    const allowedOrigins = resolveAllowedOrigins();

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        allowRequest: (
            req: IncomingMessage,
            callback: (err: string | null | undefined, success: boolean) => void
        ) => {
            const originHeader = req.headers.origin;
            if (typeof originHeader === 'string' && originHeader.trim().length > 0) {
                const normalized = normalizeOrigin(originHeader);
                if (!allowedOrigins.includes(normalized)) {
                    callback('Origen no permitido.', false);
                    return;
                }
            }
            callback(null, true);
        },
    });

    const tokenService = new JwtTokenService();
    const chatRepo = new PrismaChatMessageRepository();
    const matchRepo = new PrismaMatchRepository();
    const sendChatMessageUseCase = new SendChatMessageUseCase(chatRepo, matchRepo);

    // 1. Middleware de Autenticación JWT para WebSockets
    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token = extractHandshakeToken(socket);

            if (!token) {
                return next(new Error('UNAUTHORIZED: Token no proporcionado.'));
            }

            const payload = tokenService.verifyToken(token);
            const userId =
                typeof payload.userId === 'string' && payload.userId.trim().length > 0
                    ? payload.userId.trim()
                    : null;

            const expClaim = payload['exp'];
            const tokenExpMs =
                typeof expClaim === 'number' && Number.isFinite(expClaim)
                    ? expClaim * 1000
                    : null;

            if (!userId || tokenExpMs === null) {
                return next(new Error('UNAUTHORIZED: Token inválido o sin expiración.'));
            }

            if (tokenExpMs <= Date.now()) {
                return next(new Error('TOKEN_EXPIRED: Tu sesión ha expirado.'));
            }

            socket.userId = userId;
            socket.tokenExpMs = tokenExpMs;
            socket.activeMatchId = null;
            socket.roomOpVersion = 0;
            next();
        } catch (error: unknown) {
            const message =
                error instanceof Error && error.name === 'TokenExpiredError'
                    ? 'TOKEN_EXPIRED: Tu sesión ha expirado.'
                    : 'UNAUTHORIZED: Token inválido o expirado.';
            next(new Error(message));
        }
    });

    const enforceActiveToken = <T>(
        socket: AuthenticatedSocket,
        ack?: unknown
    ): boolean => {
        if (
            !socket.userId ||
            typeof socket.tokenExpMs !== 'number' ||
            Date.now() >= socket.tokenExpMs
        ) {
            const message = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
            socket.emit('chat_error', { code: 'TOKEN_EXPIRED', message });
            safeAck<T>(ack, { ok: false, code: 'TOKEN_EXPIRED', error: message });
            socket.disconnect(true);
            return false;
        }

        return true;
    };

    // 2. Manejo de conexiones y eventos
    io.on('connection', (socket: AuthenticatedSocket) => {
        let expirationTimer: ReturnType<typeof setTimeout> | undefined;

        const scheduleExpirationDisconnect = (): void => {
            if (typeof socket.tokenExpMs !== 'number') {
                socket.disconnect(true);
                return;
            }

            const remainingMs = socket.tokenExpMs - Date.now();
            if (remainingMs <= 0) {
                enforceActiveToken(socket);
                return;
            }

            const delayMs = Math.min(remainingMs, MAX_TIMEOUT_MS);
            expirationTimer = setTimeout(scheduleExpirationDisconnect, delayMs);
        };

        scheduleExpirationDisconnect();

        // Unirse a una sala privada de un Match específico
        socket.on('join_match_room', async (rawMatchId: unknown, ack?: unknown) => {
            if (!enforceActiveToken<{ matchId: string }>(socket, ack)) {
                return;
            }

            const matchId = extractMatchId(rawMatchId);
            if (!matchId) {
                const message = 'El identificador del match es inválido.';
                socket.emit('chat_error', { code: 'INVALID_PAYLOAD', message });
                safeAck<{ matchId: string }>(ack, {
                    ok: false,
                    code: 'INVALID_PAYLOAD',
                    error: message,
                });
                return;
            }

            const opVersion = (socket.roomOpVersion ?? 0) + 1;
            socket.roomOpVersion = opVersion;

            try {
                const match = await matchRepo.findById(matchId);

                if (
                    !socket.connected ||
                    socket.roomOpVersion !== opVersion ||
                    !enforceActiveToken<{ matchId: string }>(socket, ack)
                ) {
                    safeAck<{ matchId: string }>(ack, {
                        ok: false,
                        code: 'STALE_OPERATION',
                        error: 'La solicitud de ingreso a la sala quedó obsoleta.',
                    });
                    return;
                }

                if (!match) {
                    const message = 'El Match no existe.';
                    socket.emit('chat_error', { code: 'NOT_FOUND', message });
                    safeAck<{ matchId: string }>(ack, {
                        ok: false,
                        code: 'NOT_FOUND',
                        error: message,
                    });
                    return;
                }

                const isParticipant =
                    match.user1Id === socket.userId || match.user2Id === socket.userId;

                if (!isParticipant) {
                    const message = 'No tienes permiso para unirte a esta sala.';
                    socket.emit('chat_error', { code: 'FORBIDDEN', message });
                    safeAck<{ matchId: string }>(ack, {
                        ok: false,
                        code: 'FORBIDDEN',
                        error: message,
                    });
                    return;
                }

                if (socket.activeMatchId && socket.activeMatchId !== matchId) {
                    await socket.leave(socket.activeMatchId);
                }

                if (!socket.connected || socket.roomOpVersion !== opVersion) {
                    safeAck<{ matchId: string }>(ack, {
                        ok: false,
                        code: 'STALE_OPERATION',
                        error: 'La solicitud de ingreso a la sala quedó obsoleta.',
                    });
                    return;
                }

                await socket.join(matchId);
                socket.activeMatchId = matchId;
                socket.emit('joined_room', { matchId });
                safeAck<{ matchId: string }>(ack, { ok: true, data: { matchId } });
            } catch {
                const message = 'Error al unirse a la sala.';
                socket.emit('chat_error', { code: 'SEND_FAILED', message });
                safeAck<{ matchId: string }>(ack, {
                    ok: false,
                    code: 'SEND_FAILED',
                    error: message,
                });
            }
        });

        // Abandonar una sala privada al cambiar de conversación
        socket.on('leave_match_room', async (rawMatchId: unknown, ack?: unknown) => {
            const matchId = extractMatchId(rawMatchId);
            if (!matchId) {
                const message = 'El identificador del match es inválido.';
                socket.emit('chat_error', { code: 'INVALID_PAYLOAD', message });
                safeAck<{ matchId: string }>(ack, {
                    ok: false,
                    code: 'INVALID_PAYLOAD',
                    error: message,
                });
                return;
            }

            socket.roomOpVersion = (socket.roomOpVersion ?? 0) + 1;
            await socket.leave(matchId);
            if (socket.activeMatchId === matchId) {
                socket.activeMatchId = null;
            }
            safeAck<{ matchId: string }>(ack, { ok: true, data: { matchId } });
        });

        // Enviar mensaje, guardar en PostgreSQL y emitir a la sala
        socket.on('send_message', async (rawPayload: unknown, ack?: unknown) => {
            if (!enforceActiveToken<ChatMessageEntity>(socket, ack)) {
                return;
            }

            if (!isRecord(rawPayload)) {
                const message = 'El formato del mensaje es inválido.';
                socket.emit('chat_error', { code: 'INVALID_PAYLOAD', message });
                safeAck<ChatMessageEntity>(ack, {
                    ok: false,
                    code: 'INVALID_PAYLOAD',
                    error: message,
                });
                return;
            }

            const matchId = extractMatchId(rawPayload['matchId']);
            const rawContent = rawPayload['content'];

            if (!matchId || typeof rawContent !== 'string') {
                const message = 'Los campos matchId y content son obligatorios.';
                socket.emit('chat_error', { code: 'INVALID_PAYLOAD', message });
                safeAck<ChatMessageEntity>(ack, {
                    ok: false,
                    code: 'INVALID_PAYLOAD',
                    error: message,
                });
                return;
            }

            const trimmedContent = rawContent.trim();
            if (trimmedContent.length === 0) {
                const message = 'El contenido del mensaje no puede estar vacío.';
                socket.emit('chat_error', { code: 'INVALID_PAYLOAD', message });
                safeAck<ChatMessageEntity>(ack, {
                    ok: false,
                    code: 'INVALID_PAYLOAD',
                    error: message,
                });
                return;
            }

            if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
                const message = 'El mensaje excede el límite máximo de 1000 caracteres.';
                socket.emit('chat_error', { code: 'INVALID_PAYLOAD', message });
                safeAck<ChatMessageEntity>(ack, {
                    ok: false,
                    code: 'INVALID_PAYLOAD',
                    error: message,
                });
                return;
            }

            try {
                // senderId proviene exclusivamente de la identidad verificada del socket
                const savedMessage = await sendChatMessageUseCase.execute({
                    matchId,
                    senderId: socket.userId as string,
                    content: trimmedContent,
                });

                // Emitimos el mensaje persistido a ambos usuarios en la sala y confirmamos por ACK
                io.to(matchId).emit('receive_message', savedMessage);
                safeAck<ChatMessageEntity>(ack, { ok: true, data: savedMessage });
            } catch (error: unknown) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'No se pudo enviar el mensaje.';
                const code: SocketErrorCode = message.includes('permiso')
                    ? 'FORBIDDEN'
                    : message.includes('no existe')
                      ? 'NOT_FOUND'
                      : 'SEND_FAILED';

                socket.emit('chat_error', { code, message });
                safeAck<ChatMessageEntity>(ack, { ok: false, code, error: message });
            }
        });

        socket.on('disconnect', () => {
            if (expirationTimer !== undefined) {
                clearTimeout(expirationTimer);
            }
            socket.roomOpVersion = (socket.roomOpVersion ?? 0) + 1;
            socket.activeMatchId = null;
        });
    });

    return io;
};
