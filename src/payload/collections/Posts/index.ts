import type { CollectionConfig } from "payload/types";

import richText from "../../fields/richText";
import { tenant } from "../../fields/tenant";
import { loggedIn } from "./access/loggedIn";
import { tenantAdmins } from "./access/tenantAdmins";
import { apiOrTenants } from "./access/apiOrTenants";
import formatSlug from "./hooks/formatSlug";
import payload from "payload";

import { tenantAdminFieldAccess } from "../../fields/tenant/access/tenantAdmins";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
  },
  access: {
    read: apiOrTenants,
    create: loggedIn,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [formatSlug("title")],
      },
    },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "text",
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
      hooks: {
        beforeChange: [
          () => {
            return new Date();
          },
        ],
      },
    },
    {
      label: "Author",
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        position: "sidebar",
      },
      access: {
        create: tenantAdminFieldAccess,
        update: tenantAdminFieldAccess,
      },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeChange: [
          async ({ req }) => {
            return req.user.id;
          },
        ],
      },
    },
    {
      name: "updatedBy",
      type: "relationship",
      relationTo: "users",
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeChange: [
          async ({ req }) => {
            return req.user.id;
          },
        ],
      },
    },
    {
      label: "Cover Image",
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    tenant,
    richText(),
  ],
};
