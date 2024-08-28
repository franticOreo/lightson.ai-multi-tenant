import type { CollectionConfig } from "payload/types";
import { tenant } from "../../fields/tenant";
import { superAdmins } from '../../access/superAdmins'
import { tenantAdmins } from "./access/tenantAdmins";
import { tenants } from "./access/tenants";
import { redeployProjectWithNewEnvVars } from "./hooks/redeployProjectWithNewEnvVars";

export const Business: CollectionConfig = {
  slug: "business",
  admin: {
    useAsTitle: "businessName",
    defaultColumns: ["businessName", "updatedAt"],
  },
  access: {
    read: tenants,
    create: superAdmins,
    update: tenantAdmins,
    delete: tenantAdmins,
  },
  fields: [
    {
      label: "Full Name",
      name: "fullName",
      type: "text",
      required: false,
    },
    {
      label: "Instagram Handle",
      name: "instagramHandle",
      type: "text",
      required: false,
      admin: {
        hidden: true,
      },
    },
    {
      label: "Phone Number",
      name: "phoneNumber",
      type: "text",
      required: false,
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
      required: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Business Bio",
      name: "businessBio",
      type: "textarea",
      required: false,
      admin: {
        hidden: true,
      },
    },
    {
      label: "Business Address",
      name: "businessAddress",
      type: "textarea",
      required: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Operating Hours",
      name: "operatingHours",
      type: "text",
      required: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      label: "Language Style",
      name: "languageStyle",
      type: "text",
      required: false,
      admin: {
        hidden: true,
      },
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
          required: false,
        },
      ],
    },
    {
      label: "Service Area",
      name: "serviceArea",
      type: "textarea",
      required: false,
    },
    {
      label: "User ID",
      name: "userId",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      label: "Primary Color",
      name: "primaryColor",
      type: "text",
      required: false,
    },
    {
      label: "Secondary Color",
      name: "secondaryColor",
      type: "text",
      required: false,
    },
    {
      label: "Vercel Production URL",
      name: "vercelProductionURL",
      type: "text",
      required: false,
      admin: {
        hidden: true, // Hide this field
      },
    },
    {
      label: "Vercel Project ID",
      name: "vercelProjectId",
      type: "text",
      required: false,
      admin: {
        hidden: false, // Hide this field
      },
    },
    {
      label: "About Page",
      name: "aboutPage",
      type: "textarea",
      required: false,
    },
    {
      label: "Service List",
      name: "serviceList",
      type: "array",
      required: false,
      index: true,
      fields: [
        {
          name: "service",
          type: "text",
          required: false,
        },
      ],
    },
    tenant,
  ],
  hooks: {
    afterChange: [redeployProjectWithNewEnvVars]
  }
};
