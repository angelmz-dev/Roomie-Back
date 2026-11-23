import { Router } from 'express';
import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware.js';
import { PrismaChatMessageRepository } from '../../repositories/prisma-chat-message.repository.js';
import { PrismaMatchRepository } from '../../repositories/prisma-match.repository.js';
import { GetChatHistoryUseCase } from '../../../application/use-cases/get-chat-history.use-case.js';
import { ChatController } from '../controllers/chat.controller.js';

const chatRoutes = Router();

const chatRepo = new PrismaChatMessageRepository();
const matchRepo = new PrismaMatchRepository();
const getChatHistoryUseCase = new GetChatHistoryUseCase(chatRepo, matchRepo);
const chatController = new ChatController(getChatHistoryUseCase);

chatRoutes.get('/:matchId/messages', jwtAuthMiddleware, chatController.getHistory);

export { chatRoutes };