import payload from 'payload';
import { CollectionBeforeChangeHook } from 'payload/types';

export const beforeChangeHook: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
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