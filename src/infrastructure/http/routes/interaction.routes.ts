// src/infrastructure/http/routes/interaction.routes.ts
import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller.js';
import { PrismaInteractionRepository } from '../../repositories/prisma-interaction.repository.js';
import { PrismaMatchRepository } from '../../repositories/prisma-match.repository.js';
import { CreateInteractionUseCase } from '../../../application/use-cases/create-interaction.use-case.js';
import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware.js';
import { GetMyMatchesUseCase } from '../../../application/use-cases/get-my-matches.use-case.js';
import { MatchController } from '../controllers/match.controller.js';

const router = Router();

// --- Instancias de Infraestructura ---
const interactionRepository = new PrismaInteractionRepository();
const matchRepository = new PrismaMatchRepository();

// --- Instancias de Caso de Uso ---
const createInteractionUseCase = new CreateInteractionUseCase(interactionRepository, matchRepository);

// --- Instancias HTTP ---
const interactionController = new InteractionController(createInteractionUseCase);
//instancias match controller
const getMyMatchesUseCase = new GetMyMatchesUseCase(matchRepository);
const matchController = new MatchController(getMyMatchesUseCase);

// --- Endpoints Privados ---
router.post('/', jwtAuthMiddleware, interactionController.swipe);
// Nuevo endpoint para obtener la bandeja de matches
router.get('/matches/me', jwtAuthMiddleware, matchController.getMyMatches);

export { router as interactionRoutes };
