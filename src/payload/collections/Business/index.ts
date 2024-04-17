import type { CollectionConfig } from "payload/types";

import { tenant } from "../../fields/tenant";
import { loggedIn } from "./access/loggedIn";
import { tenantAdmins } from "./access/tenantAdmins";
import { isSuperOrPublic } from "../Users/utilities/isSuperOrPublic";

export const Business: CollectionConfig = {
  slug: "business",
  admin: {
    useAsTitle: "businessName",
    defaultColumns: ["businessName", "updatedAt"],
  },
  access: {
    read: isSuperOrPublic,
    create: loggedIn,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  fields: [
    {
      label: "Client Name",
      name: "clientName",
      type: "text",
      required: true,
    },
    {
      label: "Instagram Handle",
      name: "instagramHandle",
      type: "text",
      required: true,
    },
    {
      label: "Phone Number",
      name: "phoneNumber",
      type: "text",
      required: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: true,
    },
    {
      label: "Business Name",
      name: "businessName",
      type: "text",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Business Bio",
      name: "businessBio",
      type: "textarea",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Business Address",
      name: "businessAddress",
      type: "textarea",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Operating Hours",
      name: "operatingHours",
      type: "text",
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Language Style",
      name: "languageStyle",
      type: "text",
      required: true,
    },
    {
      label: "Keywords",
      name: "keywords",
      type: "array",
      index: true,
      fields: [
        {
          name: "keyword",
          type: "text",
          required: true,
        },
      ],
    },
    {
      label: "Service Area",
      name: "serviceArea",
      type: "textarea",
      required: true,
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
    tenant,
  ],
};
