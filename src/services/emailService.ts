import { logger } from '../utils/logger'

export async function sendEmailSimulation(email: string, blogTitle: string) {
  // Demo: just log instead of sending real email
  logger.info(`📧 Email sent to ${email} for blog: "${blogTitle}"`)
}
