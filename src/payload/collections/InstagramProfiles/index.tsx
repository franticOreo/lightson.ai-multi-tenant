import { CollectionConfig } from 'payload/types';
import { superAdmins } from '../../access/superAdmins';
import { anyone } from '../../access/anyone';
import { CollectionBeforeChangeHook } from 'payload/types';
import payload from 'payload';

const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    const { instagramUserId } = data;

    // Find existing token with the same instagramUserId
    const existingToken = await payload.find({
      collection: 'instagramProfiles',
      where: {
        instagramUserId: {
          equals: instagramUserId,
        },
      },
      limit: 1,
    });

    // If an existing token is found and it's not the same document being updated
    if (existingToken.docs.length > 0 && existingToken.docs[0].id !== data.id) {
      // Delete the existing token
      await payload.delete({
        collection: 'instagramProfiles',
        id: existingToken.docs[0].id,
      });
    }
  }
};

export const InstagramProfiles: CollectionConfig = {
  slug: 'instagramProfiles',
  access: {
    create: anyone,
    read: superAdmins,
    update: superAdmins,
    delete: superAdmins,
  },
  fields: [
    {
      name: 'payloadUserId',
      type: 'text',
      required: false,
      unique: true,
    },
    {
      name: 'instagramUserId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'instagramHandle',
      type: 'text',
      required: true,
    },
    {
      name: 'accessToken',
      type: 'text',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [beforeChangeHook]
  }
};