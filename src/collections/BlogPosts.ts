import { CollectionConfig } from 'payload'
import { logger } from '../utils/logger'
import { enqueueBlogNotification } from '../queues/blogNotification/producer'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea', required: true },
    { name: 'published', type: 'checkbox', defaultValue: false },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation }) => {
        // Only send notification for newly created published posts
        const shouldSendNotification = operation === 'create' && doc.published
        if (shouldSendNotification && doc.tags?.length > 0) {
          try {
            const message = {
              blogId: doc.id,
              title: doc.title,
              tags: doc.tags,
            }
            // Enqueue the blog notification job
            await enqueueBlogNotification(message)
            logger.info(`Enqueing blog notification: ${doc.title}`)
          } catch (error) {
            logger.error('Failed to enqueue message', error)
          }
        }
      },
    ],
  },
}
