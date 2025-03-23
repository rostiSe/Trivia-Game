import { PrismaClient } from '@prisma/client';

const prismaClienSingleton = () => {
    return new PrismaClient();
}


const prisma = globalThis.prismaGlobal && prismaClienSingleton();

export default prisma