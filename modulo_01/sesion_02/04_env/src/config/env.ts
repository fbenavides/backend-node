import dotenv from 'dotenv';
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
  API_URL: z.string(),
  PORT: z.string(),
  DB_URL: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
})

const _env = envSchema.parse(process.env)

export const env = {
  API_URL: _env.API_URL,
  PORT: Number(_env.PORT),
  DB_URL: _env.DB_URL,
  NODE_ENV: _env.NODE_ENV
}