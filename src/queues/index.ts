import amqp, { Channel } from 'amqplib'
import { logger } from '../utils/logger'
import { QUEUES } from './queueNames'

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

const channels: Record<string, Channel> = {}

export async function initQueue(): Promise<void> {
  try {
    const connection = await amqp.connect(RABBIT_URL)

    connection.on('close', async () => {
      logger.error('RabbitMQ connection closed. Reconnecting...')
      Object.keys(channels).forEach((key) => delete channels[key])
      await initQueue()
    })

    for (const key in QUEUES) {
      const queueName = QUEUES[key as keyof typeof QUEUES]
      const channel = await connection.createChannel()
      await channel.assertQueue(queueName, { durable: true })
      channels[queueName] = channel
      logger.info(`RabbitMQ queue '${queueName}' is ready`)
    }
  } catch (err) {
    logger.error('Failed to initialize RabbitMQ:', err)
    throw err
  }
}

export function getChannel(queueName: string): Channel {
  const channel = channels[queueName]
  if (!channel) throw new Error(`Channel for queue "${queueName}" not initialized`)
  return channel
}

export async function publishToQueue(queueName: string, message: object): Promise<void> {
  try {
    const channel = getChannel(queueName)
    const buffer = Buffer.from(JSON.stringify(message))
    channel.sendToQueue(queueName, buffer, { persistent: true })
    logger.info(`📨 Message sent to queue: ${queueName}`)
  } catch (error) {
    logger.error('Failed to publish message', error)
  }
}
