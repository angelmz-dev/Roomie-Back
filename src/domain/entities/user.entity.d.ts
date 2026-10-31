export declare class UserEntity {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly passwordHash: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, email: string, fullName: string, passwordHash: string, createdAt: Date, updatedAt: Date);
    private validate;
}
//# sourceMappingURL=user.entity.d.ts.map