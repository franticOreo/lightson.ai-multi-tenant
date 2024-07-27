import type { Access } from 'payload/types'

import { isSuperAdmin } from '../../../utilities/isSuperAdmin'

export const tenants: Access = ({ req: { user, headers }, data }) => {
  // Check for API key first
  const apiKey = headers['x-api-key'];
  if (apiKey === process.env.POSTS_API_KEY) {
    return true;
  }

  // Existing logic for tenant-based access control
  return (data?.tenant?.id && user?.lastLoggedInTenant?.id === data.tenant.id) ||
    (!user?.lastLoggedInTenant?.id && isSuperAdmin(user)) || {
    tenant: {
      equals: user?.lastLoggedInTenant?.id,
    },
  };
}
