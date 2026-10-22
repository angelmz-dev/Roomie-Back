// src/application/ports/password-hasher.interface.ts
export interface IPasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}

// src/application/dtos/register-user.dto.ts
export interface RegisterUserDTO {
    email: string;
    fullName: string;
    passwordText: string;
}