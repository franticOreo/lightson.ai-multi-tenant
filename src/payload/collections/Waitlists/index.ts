import { CollectionConfig } from 'payload/types';
import { superAdmins } from '../../access/superAdmins';
import { anyone } from '../../access/anyone';

export const Waitlists: CollectionConfig = {
  slug: 'waitlists',
  access: {
    create: anyone,
    read: superAdmins,
    update: superAdmins,
    delete: superAdmins,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'instagramHandle',
      type: 'text',
      required: true,
      maxLength: 30,
    },
  ],
  hooks: {
    // Define any necessary hooks here
  },
};

    // {
    //   name: 'surveyResponse1',
    //   type: 'select',
    //   options: ['Option 1', 'Option 2', 'Option 3'],
    //   required: true,
    // },
    // {
    //   name: 'surveyResponse2',
    //   type: 'select',
    //   options: ['Option 1', 'Option 2', 'Option 3'],
    //   required: true,
    // },