import { FastifyInstance } from "fastify";

export class AuthRepo {
    private prisma;

    constructor(app: FastifyInstance) {
        this.prisma =  app.prisma;
    }

    async findByEmail(email: string) {
        return await this.prisma.user.findUnique({ where: { email: email } });
    }

    async createUser(email: string, password: string, username: string) {
        return await this.prisma.user.create({
            data: {
                email: email,
                password: password,
                username: username,
            }
        });
    }

    async verifyEmail(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true }
        });
    }

    async updatePassword(userId: string, newPassword: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword,
            }
        })
    }
}
