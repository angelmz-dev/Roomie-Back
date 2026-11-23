// src/infrastructure/http/middlewares/upload-image.middleware.ts
import multer from 'multer';
import type { Request } from 'express';

// Almacenamiento en RAM (Buffer), cero escritura en disco local
const storage = multer.memoryStorage();

// Validación defensiva de tipos MIME permitidos
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WEBP).'));
    }
};

export const uploadAvatarMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Límite estricto de 5 MB por imagen
    },
}).single('avatar'); // 'avatar' será el nombre del campo en el form-data