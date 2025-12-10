import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod' 
import { webhooks } from '@/db/schema'
import { db } from '@/db'
import { inArray } from 'drizzle-orm'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google';

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/generate', 
    {
      schema: {
        summary: 'Generate Typescript handler for the webhook',
        tags: ['Webhooks'],
        body: z.object({
          webhookIds: z.array(z.string()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        }
      }
    }, 
    async (request, reply) => {
      const { webhookIds } = request.body

      const result = await db
        .select({ body: webhooks.body })
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds))
      
      const webhooksBodies = result.map(webhook => webhook.body).join('\n\n')

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `
          You will receive multiple webhook request body examples. Your task is to analyze these examples and identify all possible event types and their respective payload structures.

          Then, generate a complete TypeScript handler function that:
          1. Uses Zod to validate the request body.
          2. Detects which webhook event has been received.
          3. Safely handles each event with a corresponding handler function.
          4. Provides types inferred from Zod for better type safety.

          Instructions:
          - Create a Zod schema that covers all possible webhook event types.
          - Use a type-safe 'switch' or conditional logic to call the correct handler based on the event type.
          - Each handler function should be implemented with dummy logic so I can later fill in the real behavior.
          - The final output must include:
            - Zod schemas
            - Inferred TypeScript types
            - The main handler function
            - A map or switch to route events to handlers

          Now provide the TypeScript code **only**, without explanations.

          Here are the webhook request examples:
    
          """
          ${webhooksBodies}
          """
        `.trim(),
      })

      return reply.status(201).send({ code: text })
    }
  )
}