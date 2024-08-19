import type { Access } from 'payload/types'
import { isSuperAdmin } from '../../../utilities/isSuperAdmin'

export const tenants: Access = ({ req: { user }, data }) => {
  return (data?.tenant?.id && user?.lastLoggedInTenant?.id === data.tenant.id) ||
    (!user?.lastLoggedInTenant?.id && isSuperAdmin(user)) || {
    tenant: {
      equals: user?.lastLoggedInTenant?.id,
    },
  };
}
