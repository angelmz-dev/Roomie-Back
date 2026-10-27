// src/infrastructure/http/routes/profile.routes.ts
import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { PrismaLifestyleProfileRepository } from '../../repositories/prisma-lifestyle.repository.js';
import { CreateLifestyleProfileUseCase } from '../../../application/use-cases/create-lifestyle-profile.use-case.js';
import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware.js';

const router = Router();

// --- Ensamblaje de Dependencias (Composition Root) ---
const profileRepository = new PrismaLifestyleProfileRepository();
const createProfileUseCase = new CreateLifestyleProfileUseCase(profileRepository);
const profileController = new ProfileController(createProfileUseCase);

// --- Definición de Rutas Privadas ---
// Inyectamos jwtAuthMiddleware directamente antes del controlador
router.post('/', jwtAuthMiddleware, profileController.create);

export { router as profileRoutes };