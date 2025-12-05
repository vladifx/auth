import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

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

    async updateUserData(userId: string, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: { id: userId },
            data
        });
    }
}
