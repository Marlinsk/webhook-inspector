import { z } from "zod"

// Common webhook schemas shared between API and Web
export const webhookSchema = z.object({
	id: z.string().uuid(),
	method: z.string(),
	pathname: z.string(),
	headers: z.record(z.string(), z.string()),
	body: z.unknown().nullable(),
	ip: z.string().nullable(),
	createdAt: z.coerce.date(),
})

export type Webhook = z.infer<typeof webhookSchema>

export const webhooksListSchema = z.object({
	webhooks: z.array(webhookSchema),
	nextCursor: z.string().nullable(),
})

export type WebhooksList = z.infer<typeof webhooksListSchema>
