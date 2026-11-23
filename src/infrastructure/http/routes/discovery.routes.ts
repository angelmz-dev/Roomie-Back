// src/infrastructure/http/routes/discovery.routes.ts
import { Router } from 'express';
import { DiscoveryController } from '../controllers/discovery.controller.js';
import { PrismaDiscoveryRepository } from '../../repositories/prisma-discovery.repository.js';
import { PrismaLifestyleProfileRepository } from '../../repositories/prisma-lifestyle.repository.js';
import { GetCompatibleProfilesUseCase } from '../../../application/use-cases/get-compatible-profiles.use-case.js';
import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware.js';

const router = Router();

// --- Ensamblaje de Dependencias ---
const discoveryRepository = new PrismaDiscoveryRepository();
const profileRepository = new PrismaLifestyleProfileRepository(); // Reutilizamos este adaptador

const getCompatibleProfilesUseCase = new GetCompatibleProfilesUseCase(
    discoveryRepository,
    profileRepository
);

const discoveryController = new DiscoveryController(getCompatibleProfilesUseCase);

// --- Endpoints Privados ---
router.get('/feed', jwtAuthMiddleware, discoveryController.getFeed);

export { router as discoveryRoutes };
