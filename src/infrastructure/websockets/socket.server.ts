import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { JwtTokenService } from '../services/jwt-token.service.js';
import { PrismaChatMessageRepository } from '../repositories/prisma-chat-message.repository.js';
import { PrismaMatchRepository } from '../repositories/prisma-match.repository.js';
import { SendChatMessageUseCase } from '../../application/use-cases/send-chat-message.use-case.js';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

export const initializeSocketServer = (httpServer: HttpServer): SocketIOServer => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
        },
    });

    const tokenService = new JwtTokenService();
    const chatRepo = new PrismaChatMessageRepository();
    const matchRepo = new PrismaMatchRepository();
    const sendChatMessageUseCase = new SendChatMessageUseCase(chatRepo, matchRepo);

    // 1. Middleware de Autenticación JWT para WebSockets
    io.use((socket: AuthenticatedSocket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Autenticación requerida: Token no proporcionado.'));
            }

            // Ajusta el nombre del método si en tu JwtTokenService se llama distinto (ej. verify / verifyToken)
            const payload = tokenService.verifyToken(token) as { userId?: string; id?: string } | null;
            const userId = payload?.userId || payload?.id;

            if (!userId) {
                return next(new Error('Token inválido o expirado.'));
            }

            socket.userId = userId;
            next();
        } catch {
            next(new Error('Error al verificar el token JWT.'));
        }
    });

    // 2. Manejo de conexiones y eventos
    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`🔌 Usuario conectado al chat: ${socket.userId} (Socket: ${socket.id})`);

        // Unirse a una sala privada de un Match específico
        socket.on('join_match_room', async (matchId: string) => {
            try {
                const match = await matchRepo.findById(matchId);
                if (!match) {
                    socket.emit('chat_error', { message: 'El Match no existe.' });
                    return;
                }

                const isParticipant =
                    match.user1Id === socket.userId || match.user2Id === socket.userId;

                if (!isParticipant) {
                    socket.emit('chat_error', { message: 'No tienes permiso para unirte a esta sala.' });
                    return;
                }

                socket.join(matchId);
                socket.emit('joined_room', { matchId });
                console.log(`🏠 Usuario ${socket.userId} se unió a la sala ${matchId}`);
            } catch (error) {
                socket.emit('chat_error', { message: 'Error al unirse a la sala.' });
            }
        });

        // Enviar mensaje, guardar en PostgreSQL y emitir a la sala
        socket.on('send_message', async (data: { matchId: string; content: string }) => {
            try {
                if (!socket.userId) return;

                const savedMessage = await sendChatMessageUseCase.execute({
                    matchId: data.matchId,
                    senderId: socket.userId,
                    content: data.content,
                });

                // Emitimos el mensaje persistido a ambos usuarios en la sala
                io.to(data.matchId).emit('receive_message', savedMessage);
            } catch (error: any) {
                socket.emit('chat_error', {
                    message: error.message || 'No se pudo enviar el mensaje.',
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Usuario desconectado: ${socket.userId}`);
        });
    });

    return io;
};