import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { resolve } from 'path'

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'

  if (dbUrl.startsWith('file:./') || dbUrl.startsWith('file:../')) {
    const url = `file:${resolve(process.cwd(), dbUrl.slice(5))}`
    const adapter = new PrismaLibSql({ url })
    return new PrismaClient({ adapter })
  }

  // Remote URL — extract authToken from query param if present
  const parsed = new URL(dbUrl)
  const authToken = parsed.searchParams.get('authToken') ?? process.env.DATABASE_AUTH_TOKEN ?? ''
  parsed.searchParams.delete('authToken')
  const url = parsed.toString()

  const adapter = new PrismaLibSql({ url, authToken })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
