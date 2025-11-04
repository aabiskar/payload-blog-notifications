import { publishToQueue } from '../index'
import { QUEUES } from '../queueNames'
import { logger } from '../../utils/logger'

export async function enqueueBlogNotification(message: {
  blogId: string
  title: string
  tags: string[]
}) {
  await publishToQueue(QUEUES.BLOG_EMAIL_QUEUE, message)
  logger.info('Enqueued blog notification', { title: message.title, tags: message.tags })
}
