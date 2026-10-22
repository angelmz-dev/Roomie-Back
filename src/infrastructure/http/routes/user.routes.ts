import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case.js';
import { PrismaUserRepository } from '../../repositories/prisma-user.repository.js';
import { BcryptPasswordHasher } from '../../services/bcrypt-password-hasher.service.js';

const router = Router();

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();

const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);

const userController = new UserController(registerUserUseCase);

router.post('/register', userController.register);

export { router as userRoutes };