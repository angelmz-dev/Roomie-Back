import type { Request, Response } from 'express';
import { CreateLifestyleProfileUseCase } from '../../../application/use-cases/create-lifestyle-profile.use-case.js';
import { GetMyLifestyleProfileUseCase } from '../../../application/use-cases/get-my-lifestyle-profile.use-case.js';
import { UpdateLifestyleProfileUseCase } from '../../../application/use-cases/update-lifestyle-profile.use-case.js';
import { UploadProfileAvatarUseCase } from '../../../application/use-cases/upload-profile.use-case.js';
import type { CreateLifestyleProfileDTO } from '../../../application/dtos/create-profile.dto.js';
import type { UpdateLifestyleProfileDTO } from '../../../application/dtos/update-profile.dto.js';
export class ProfileController {
    constructor(
        private readonly createProfileUseCase: CreateLifestyleProfileUseCase,
        private readonly getMyProfileUseCase: GetMyLifestyleProfileUseCase,
        private readonly updateProfileUseCase: UpdateLifestyleProfileUseCase,
        private readonly uploadAvatarUseCase: UploadProfileAvatarUseCase

    ) { }

    public create = async (req: Request, res: Response): Promise<void> => {
        try {
            // req.user existe gracias a nuestro JwtAuthMiddleware
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            const {
                minBudget,
                maxBudget,
                preferredZones,
                hasPets,
                toleratesPets,
                isSmoker,
                toleratesSmokers,
                bio,
            } = req.body;

            // Validación defensiva (Fail-Fast)
            if (minBudget === undefined || maxBudget === undefined || !preferredZones) {
                res.status(400).json({
                    success: false,
                    error: 'Faltan campos obligatorios: minBudget, maxBudget o preferredZones.',
                });
                return;
            }

            const dto: CreateLifestyleProfileDTO = {
                userId, // Asignado de forma segura desde el Token
                minBudget: Number(minBudget),
                maxBudget: Number(maxBudget),
                preferredZones,
                hasPets: Boolean(hasPets),
                toleratesPets: Boolean(toleratesPets),
                isSmoker: Boolean(isSmoker),
                toleratesSmokers: Boolean(toleratesSmokers),
                bio,
            };

            const newProfile = await this.createProfileUseCase.execute(dto);

            res.status(201).json({
                success: true,
                message: 'Perfil de estilo de vida creado exitosamente.',
                data: newProfile,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear el perfil.';
            // Si el error es la regla de negocio (perfil duplicado), devolvemos un 409 Conflict
            const statusCode = errorMessage.includes('ya cuenta con un perfil') ? 409 : 400;

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
            });
        }
    };
    public getMyProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            const profile = await this.getMyProfileUseCase.execute(userId);

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al obtener el perfil.';
            res.status(404).json({
                success: false,
                error: errorMessage,
            });
        }
    };

    public updateMyProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            const {
                minBudget,
                maxBudget,
                preferredZones,
                hasPets,
                toleratesPets,
                isSmoker,
                toleratesSmokers,
                bio,
            } = req.body;

            // Construcción limpia del DTO respetando exactOptionalPropertyTypes
            const dto: UpdateLifestyleProfileDTO = {
                userId,
                ...(minBudget !== undefined && { minBudget: Number(minBudget) }),
                ...(maxBudget !== undefined && { maxBudget: Number(maxBudget) }),
                ...(preferredZones !== undefined && { preferredZones }),
                ...(hasPets !== undefined && { hasPets: Boolean(hasPets) }),
                ...(toleratesPets !== undefined && { toleratesPets: Boolean(toleratesPets) }),
                ...(isSmoker !== undefined && { isSmoker: Boolean(isSmoker) }),
                ...(toleratesSmokers !== undefined && { toleratesSmokers: Boolean(toleratesSmokers) }),
                ...(bio !== undefined && { bio }),
            };

            const updatedProfile = await this.updateProfileUseCase.execute(dto);

            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente.',
                data: updatedProfile,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil.';
            const statusCode = errorMessage.includes('no encontrado') ? 404 : 400;

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
            });
        }
    };

    public uploadAvatar = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
                return;
            }

            // Validación Fail-Fast: Verificar que Multer haya procesado el archivo en memoria
            if (!req.file || !req.file.buffer) {
                res.status(400).json({
                    success: false,
                    error: 'No se proporcionó ninguna imagen en el campo "avatar".',
                });
                return;
            }

            const updatedProfile = await this.uploadAvatarUseCase.execute(userId, req.file.buffer);

            res.status(200).json({
                success: true,
                message: 'Fotografía de perfil actualizada exitosamente.',
                data: updatedProfile,
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Error al subir la fotografía.';
            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    };
}