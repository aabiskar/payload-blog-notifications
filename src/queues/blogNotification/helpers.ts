import pLimit from 'p-limit'
import type { Payload } from 'payload'
import { BATCH_SIZE, CONCURRENT_EMAILS } from './constants'
import { sendEmailSimulation } from '../../services/emailService'
import { logger } from '../../utils/logger'

export const processUsersInBatches = async (
  payload: Payload,
  tags: string[],
  blogTitle: string,
): Promise<void> => {
  const totalUsersResponse = await payload.count({
    collection: 'users',
    where: { subscribedTags: { in: tags } },
  })
  const totalUsers = totalUsersResponse.totalDocs
  logger.info(`Total users to notify: ${totalUsers}`)

  let page = 0

  const limit = pLimit(CONCURRENT_EMAILS)

  while (page * BATCH_SIZE < totalUsers) {
    const usersBatch = await payload.find({
      collection: 'users',
      where: { subscribedTags: { in: tags } },
      limit: BATCH_SIZE,
      page: page + 1,
    })

    logger.info(`Batch ${page + 1} processed: ${usersBatch.docs.length} users`)

    await Promise.all(
      usersBatch.docs.map((user) => limit(async () => sendEmailSimulation(user.email, blogTitle))),
    )
    page++
  }
}
