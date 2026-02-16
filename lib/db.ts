/**
 * Prisma Client Singleton
 * 
 * This file exports a singleton instance of PrismaClient to prevent
 * multiple instances from being created in development (which can cause
 * connection pool exhaustion).
 * 
 * Usage in API routes:
 * import { prisma } from '@/lib/db'
 * const users = await prisma.session.findMany()
 */

import { PrismaClient } from '@/lib/generated/prisma'

// Declare global type for Prisma Client singleton
declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Create or retrieve the Prisma Client singleton
 * 
 * In development, we reuse the same instance across hot reloads
 * In production, we create a new instance
 */
const prisma =
  global.prisma ||
  new PrismaClient({
    // Log queries in development for debugging
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

// Store the Prisma Client in global scope during development
// This prevents creating new instances on every hot reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma }
