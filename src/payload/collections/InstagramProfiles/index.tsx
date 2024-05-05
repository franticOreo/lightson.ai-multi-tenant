import { CollectionConfig } from 'payload/types';
import { superAdmins } from '../../access/superAdmins';
import { anyone } from '../../access/anyone';
import { beforeChangeHook } from './hooks/beforeChangeHook';

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