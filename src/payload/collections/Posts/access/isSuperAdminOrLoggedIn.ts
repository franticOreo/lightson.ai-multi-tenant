import type { Access } from 'payload/config'
import { isSuperAdmin } from "../../../utilities/isSuperAdmin";

export const isSuperAdminOrLoggedIn: Access = ({ req: { user } }) => {
  return Boolean(user) || isSuperAdmin(user)
}
