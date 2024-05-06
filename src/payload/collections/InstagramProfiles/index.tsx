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
      label: "Payload User Id",
      name: "payloadUserId",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      label: "Instagram User ID",
      name: 'instagramUserId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      label: "Instagram Handle",
      name: 'instagramHandle',
      type: 'text',
      required: true,
    },
    {
      label: "Instagram Access Token",
      name: 'accessToken',
      type: 'text',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [beforeChangeHook]
  }
};