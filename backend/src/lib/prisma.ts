import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

let connectionString = process.env.DATABASE_URL?.trim() || ""

// Strip surrounding quotes if Docker --env-file passed them literally
if (
  (connectionString.startsWith('"') && connectionString.endsWith('"')) ||
  (connectionString.startsWith("'") && connectionString.endsWith("'"))
) {
  connectionString = connectionString.slice(1, -1).trim()
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
