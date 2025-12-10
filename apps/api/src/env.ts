import { z } from "zod"

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.coerce.number().positive().default(3333),
	DATABASE_URL: z.string().url().describe("PostgreSQL connection string"),
	GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional().default("info"),
})

// Parse and validate environment variables
export const env = envSchema.parse(process.env)

// Log environment info (but not sensitive data)
console.log(`🚀 Environment: ${env.NODE_ENV}`)
console.log(`🔌 Port: ${env.PORT}`)
console.log(`📊 Log Level: ${env.LOG_LEVEL}`)

// Warn if using development database in production
if (env.NODE_ENV === "production" && env.DATABASE_URL.includes("localhost")) {
	console.warn(
		"⚠️  WARNING: Using localhost database in production environment!",
	)
}

// Validate SSL mode for production
if (env.NODE_ENV === "production" && !env.DATABASE_URL.includes("sslmode=require")) {
	console.warn(
		"⚠️  WARNING: Production database should use SSL (sslmode=require)",
	)
}
