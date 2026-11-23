// src/application/ports/image-storage.interface.ts

export interface IImageStorageService {
    /**
     * Sube una imagen en formato binario a la nube y retorna su URL segura (HTTPS).
     * @param fileBuffer Buffer en memoria del archivo subido.
     * @param folder Carpeta lógica donde se almacenará (ej. 'roomiematch/avatars').
     */
    uploadImage(fileBuffer: Buffer, folder: string): Promise<string>;
}