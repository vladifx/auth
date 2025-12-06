import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

export async function initPrisma() {
    try {
        await prisma.$connect();
        console.info('Prisma is connected');
    } catch (e) {
        const err = e as Error;
        console.error("Failed to connect to Prisma: ", err.message);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;