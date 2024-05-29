import type { Access } from 'payload/types';
import { isSuperAdmin } from '../../../utilities/isSuperAdmin';
import payload from 'payload';

export const apiOrTenants: Access = async ({ req, data }) => {
  const apiKey = req.headers['x-api-key'];

  // Check if an API key is provided
  if (apiKey) {
    const user = await payload.find({
      collection: 'users',
      where: {
        apiKey: {
          equals: apiKey,
        },
      },
      limit: 1,
    });

    // If a user is found with the API key, allow access based on their role or tenant
    if (user.docs.length > 0) {
      const userId = user.docs[0].id;
      // You can customize this condition based on your requirements
      // For example, you might want to check if the user is a super admin or belongs to a specific tenant
      return {
        'createdBy': {
          equals: userId,
        },
      };
    } else {
      // If no user is found with the API key, deny access
      return false;
    }
  }

  // Fallback to existing tenant-based checks if no API key is provided
  return (
    (data?.tenant?.id && req.user?.lastLoggedInTenant?.id === data.tenant.id) ||
    (!req.user?.lastLoggedInTenant?.id && isSuperAdmin(req.user)) || {
      // list of documents
      tenant: {
        equals: req.user?.lastLoggedInTenant?.id,
      },
    }
  );
};