import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'subscribedTags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Subscribed Tags',
    },
  ],
}
