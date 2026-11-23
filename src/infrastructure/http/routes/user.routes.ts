// src/infrastructure/http/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { PrismaUserRepository } from '../../repositories/prisma-user.repository.js';
import { BcryptPasswordHasher } from '../../services/bcrypt-password-hasher.service.js';
import { JwtTokenService } from '../../services/jwt-token.service.js';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case.js';

const router = Router();

// --- COMPOSITION ROOT ---
// 1. Instanciamos los adaptadores de infraestructura
const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

// 2. Inyectamos dependencias en los Casos de Uso (Capa de Aplicación)
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

// 3. Inyectamos los Casos de Uso en el Controlador (Frontera HTTP)
const userController = new UserController(registerUserUseCase, loginUserUseCase);

// --- DEFINICIÓN DE ENDPOINTS ---
router.post('/register', userController.register);
router.post('/login', userController.login); // Mapeamos el nuevo endpoint

export { router as userRoutes };