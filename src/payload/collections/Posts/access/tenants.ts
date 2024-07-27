import type { Access } from 'payload/types'

import { isSuperAdmin } from '../../../utilities/isSuperAdmin'

export const tenants: Access = ({ req: { user, headers }, data }) => {
  // Extract API key from headers
  const apiKey = headers['x-api-key'];

  // Check if the API key is correct
  if (apiKey === process.env.POSTS_API_KEY) {
    return true;  // Allow access if API key is correct
  }

  // Deny access if API key is provided but incorrect
  if (apiKey && apiKey !== process.env.POSTS_API_KEY) {
    return false;
  }

  // Proceed to tenant-based access control only if no API key is provided
  return (data?.tenant?.id && user?.lastLoggedInTenant?.id === data.tenant.id) ||
    (!user?.lastLoggedInTenant?.id && isSuperAdmin(user)) || {
    tenant: {
      equals: user?.lastLoggedInTenant?.id,
    },
  };
}