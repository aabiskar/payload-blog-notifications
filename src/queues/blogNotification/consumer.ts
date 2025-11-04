import type { Payload } from 'payload'
import { getChannel } from '../index'
import { logger } from '../../utils/logger'
import { processUsersInBatches } from './helpers'
import { QUEUES } from '../queueNames'
import type { BlogEmailJob } from '../../types'

export const startBlogNotificationConsumer = async (payload: Payload) => {
  const queueName = QUEUES.BLOG_EMAIL_QUEUE
  const channel = getChannel(queueName)
  await channel.assertQueue(queueName, { durable: true })

  logger.info(`📬 Listening for messages on queue: ${queueName}`)

  channel.consume(
    queueName,
    async (msg) => {
      if (!msg) return
      try {
        const job: BlogEmailJob = JSON.parse(msg.content.toString())
        const { title, tags } = job
        await processUsersInBatches(payload, tags, title)
        channel.ack(msg)
      } catch (error) {
        logger.error('Error processing message:', error)
        channel.nack(msg, false, false) // discard
      }
    },
    { noAck: false },
  )
}
