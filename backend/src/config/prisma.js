// Instância única (singleton) do PrismaClient.
// Reaproveita a mesma conexão em desenvolvimento para evitar criar
// múltiplos clients a cada reload do nodemon.
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
