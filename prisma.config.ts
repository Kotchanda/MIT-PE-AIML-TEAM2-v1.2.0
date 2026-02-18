// Prisma configuration for Irish Health Insurance Chooser
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env.local file."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: databaseUrl,
  },
});
