import { db } from "."
import { webhooks } from "./schema"
import { faker } from '@faker-js/faker'

const stripeEvents = [
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.created',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_method.attached',
  'payment_method.detached',
]

function generateStripeWebhookPayload(eventType: string) {
  const baseEvent = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: faker.date.recent({ days: 30 }).getTime() / 1000,
    type: eventType,
    livemode: faker.datatype.boolean(),
  }

  if (eventType.startsWith('charge.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `ch_${faker.string.alphanumeric(24)}`,
          object: 'charge',
          amount: faker.number.int({ min: 1000, max: 100000 }),
          currency: 'usd',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          description: faker.commerce.productName(),
          status: eventType === 'charge.succeeded' ? 'succeeded' : 'failed',
        }
      }
    }
  }

  if (eventType.startsWith('payment_intent.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `pi_${faker.string.alphanumeric(24)}`,
          object: 'payment_intent',
          amount: faker.number.int({ min: 1000, max: 100000 }),
          currency: 'usd',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          status: eventType.includes('succeeded') ? 'succeeded' :
                  eventType.includes('failed') ? 'failed' : 'created',
        }
      }
    }
  }

  if (eventType.startsWith('customer.subscription.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `sub_${faker.string.alphanumeric(14)}`,
          object: 'subscription',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          status: 'active',
          plan: {
            id: `plan_${faker.string.alphanumeric(14)}`,
            amount: faker.number.int({ min: 999, max: 9999 }),
            currency: 'usd',
            interval: faker.helpers.arrayElement(['month', 'year']),
          }
        }
      }
    }
  }

  if (eventType.startsWith('invoice.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `in_${faker.string.alphanumeric(24)}`,
          object: 'invoice',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          amount_due: faker.number.int({ min: 1000, max: 50000 }),
          amount_paid: eventType === 'invoice.paid' ? faker.number.int({ min: 1000, max: 50000 }) : 0,
          currency: 'usd',
          status: eventType === 'invoice.paid' ? 'paid' :
                  eventType === 'invoice.payment_failed' ? 'open' : 'draft',
        }
      }
    }
  }

  if (eventType.startsWith('checkout.session.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `cs_${faker.string.alphanumeric(24)}`,
          object: 'checkout.session',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          amount_total: faker.number.int({ min: 1000, max: 100000 }),
          currency: 'usd',
          payment_status: eventType === 'checkout.session.completed' ? 'paid' : 'unpaid',
          status: eventType === 'checkout.session.completed' ? 'complete' : 'expired',
        }
      }
    }
  }

  if (eventType.startsWith('customer.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `cus_${faker.string.alphanumeric(14)}`,
          object: 'customer',
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          created: faker.date.past().getTime() / 1000,
        }
      }
    }
  }

  if (eventType.startsWith('payment_method.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `pm_${faker.string.alphanumeric(24)}`,
          object: 'payment_method',
          type: 'card',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          card: {
            brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
            last4: faker.string.numeric(4),
            exp_month: faker.number.int({ min: 1, max: 12 }),
            exp_year: faker.number.int({ min: 2024, max: 2030 }),
          }
        }
      }
    }
  }

  return baseEvent
}

async function seed() {
  console.log('🌱 Seeding database with Stripe webhooks...')

  const webhookRecords = []

  for (let i = 0; i < 65; i++) {
    const eventType = faker.helpers.arrayElement(stripeEvents)
    const payload = generateStripeWebhookPayload(eventType)
    const createdAt = faker.date.recent({ days: 30 })

    webhookRecords.push({
      method: 'POST',
      pathname: '/webhook',
      ip: faker.internet.ipv4(),
      statusCode: 200,
      contentType: 'application/json',
      contentLength: JSON.stringify(payload).length,
      queryParams: null,
      headers: {
        'content-type': 'application/json',
        'stripe-signature': `t=${Math.floor(createdAt.getTime() / 1000)},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
        'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
        'accept': '*/*',
        'x-stripe-client-user-agent': JSON.stringify({
          bindings_version: '5.4.0',
          lang: 'ruby',
          platform: 'x86_64-linux',
        }),
      },
      body: JSON.stringify(payload, null, 2),
      createdAt,
    })
  }

  await db.insert(webhooks).values(webhookRecords)

  console.log(`✅ Successfully seeded ${webhookRecords.length} Stripe webhook records`)
}

seed()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })