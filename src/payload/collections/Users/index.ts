import type { CollectionConfig } from "payload/types";

import { anyone } from "../../access/anyone";
import { superAdminFieldAccess } from "../../access/superAdmins";
import { adminsAndSelf } from "./access/adminsAndSelf";
import { tenantAdmins } from "./access/tenantAdmins";
import { loginAfterCreate } from "./hooks/loginAfterCreate";
import { recordLastLoggedInTenant } from "./hooks/recordLastLoggedInTenant";
import { isSuperOrTenantAdmin } from "./utilities/isSuperOrTenantAdmin";
import { v4 as uuidv4 } from 'uuid';

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    useAPIKey: true,
  },

  access: {
    read: adminsAndSelf,
    create: anyone,
    update: adminsAndSelf,
    delete: adminsAndSelf,
    admin: isSuperOrTenantAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ operation, data }) => {
        if (operation === 'create') {
          data.apiKey = uuidv4(); // Generate a new API key
        }
        return data;
      },
    ],
    afterChange: [loginAfterCreate],
    afterLogin: [recordLastLoggedInTenant],
  },
  fields: [
    {
      name: "firstName",
      type: "text",
    },
    {
      name: "lastName",
      type: "text",
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      access: {
        create: superAdminFieldAccess,
        update: superAdminFieldAccess,
        read: superAdminFieldAccess,
      },
      options: [
        {
          label: "Super Admin",
          value: "super-admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
    },
    {
      name: "tenants",
      type: "array",
      label: "Tenants",
      access: {
        create: tenantAdmins,
        update: tenantAdmins,
        read: tenantAdmins,
      },
      fields: [
        {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          required: true,
        },
        {
          name: "roles",
          type: "select",
          hasMany: true,
          required: true,
          options: [
            {
              label: "Admin",
              value: "admin",
            },
            {
              label: "User",
              value: "user",
            },
          ],
        },
      ],
    },
    {
      name: "lastLoggedInTenant",
      type: "relationship",
      relationTo: "tenants",
      index: true,
      access: {
        create: () => false,
        read: tenantAdmins,
        update: superAdminFieldAccess,
      },
      admin: {
        position: "sidebar",
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      hidden: false, // Optionally hide this from the admin UI
      access: {
        read: ({ req: { user }, doc }) => user && (user.id === doc?.id || user.roles.includes('super-admin')),
        update: () => false, // API keys should not be manually editable
        create: () => false,
      },
    },
  ],
};
