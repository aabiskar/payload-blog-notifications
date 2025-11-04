import { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'createdAt', 'updatedAt'] },
  fields: [{ name: 'name', type: 'text', required: true }],
}
