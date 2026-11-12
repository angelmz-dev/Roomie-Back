// src/infrastructure/services/cloudinary-storage.service.ts
import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from 'cloudinary';
import type { IImageStorageService } from '../../application/ports/image-storage.interface.js';

export class CloudinaryStorageService implements IImageStorageService {
    constructor() {
        // Sanitización defensiva con .trim() para eliminar espacios o saltos de línea invisibles (\r\n)
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
        const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
        const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

        // Validación Fail-Fast en el arranque del servicio
        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error(
                'Faltan las credenciales de Cloudinary en las variables de entorno (.env).'
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }

    public async uploadImage(fileBuffer: Buffer, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    transformation: [
                        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' },
                    ],
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error || !result) {
                        reject(
                            new Error(`Error al subir la imagen a Cloudinary: ${error?.message || 'Desconocido'}`)
                        );
                        return;
                    }
                    resolve(result.secure_url);
                }
            );

            uploadStream.end(fileBuffer);
        });
    }
}