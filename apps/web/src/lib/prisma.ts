import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use a single instance of PrismaClient
export const prisma =
  global.prisma ?? new PrismaClient({
    log: ["error", "warn"],
    });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
