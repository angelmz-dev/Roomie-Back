// src/infrastructure/http/routes/profile.routes.ts
import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { PrismaLifestyleProfileRepository } from '../../repositories/prisma-lifestyle.repository.js';
import { CloudinaryStorageService } from '../../services/cloudinary-storage.service.js';
import { CreateLifestyleProfileUseCase } from '../../../application/use-cases/create-lifestyle-profile.use-case.js';
import { GetMyLifestyleProfileUseCase } from '../../../application/use-cases/get-my-lifestyle-profile.use-case.js';
import { UpdateLifestyleProfileUseCase } from '../../../application/use-cases/update-lifestyle-profile.use-case.js';
import { UploadProfileAvatarUseCase } from '../../../application/use-cases/upload-profile.use-case.js';
import { jwtAuthMiddleware } from '../middlewares/jwt-auth.middleware.js';
import { uploadAvatarMiddleware } from '../middlewares/upload-image.middleware.js';


const router = Router();

// --- Ensamblaje de Dependencias (Composition Root) ---
const profileRepository = new PrismaLifestyleProfileRepository();
const imageStorageService = new CloudinaryStorageService();
const createProfileUseCase = new CreateLifestyleProfileUseCase(profileRepository);
const getMyProfileUseCase = new GetMyLifestyleProfileUseCase(profileRepository);
const updateProfileUseCase = new UpdateLifestyleProfileUseCase(profileRepository);
const uploadAvatarUseCase = new UploadProfileAvatarUseCase(profileRepository, imageStorageService);
const profileController = new ProfileController(
    createProfileUseCase,
    getMyProfileUseCase,
    updateProfileUseCase,
    uploadAvatarUseCase,
);

// --- Definición de Rutas Privadas ---
// Inyectamos jwtAuthMiddleware directamente antes del controlador
router.post('/', jwtAuthMiddleware, profileController.create);
router.get('/me', jwtAuthMiddleware, profileController.getMyProfile);
router.patch('/me', jwtAuthMiddleware, profileController.updateMyProfile);
router.patch('/me/avatar', jwtAuthMiddleware, uploadAvatarMiddleware, profileController.uploadAvatar);


export { router as profileRoutes };
