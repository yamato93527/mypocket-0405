import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaConnectionString?: string;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = process.env.DATABASE_URL;
const connectionUrl = new URL(connectionString);
const sslMode = connectionUrl.searchParams.get("sslmode");
const allowSelfSignedTls = sslMode === "require";
const effectiveConnectionString = allowSelfSignedTls
  ? (() => {
      connectionUrl.searchParams.set("sslmode", "no-verify");
      return connectionUrl.toString();
    })()
  : connectionString;

const adapter = new PrismaPg({
  connectionString: effectiveConnectionString,
  ssl: allowSelfSignedTls ? { rejectUnauthorized: false } : undefined,
});

const shouldReusePrisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaConnectionString === effectiveConnectionString;

const prisma = shouldReusePrisma && globalForPrisma.prisma
  ? globalForPrisma.prisma
  : new PrismaClient({
      adapter,
    });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = effectiveConnectionString;
}

export default prisma;