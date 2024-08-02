import type { Payload } from "payload";

import dotenv from 'dotenv';

dotenv.config();

export const seed = async (payload: Payload): Promise<void> => {
  // create super admin
  await payload.create({
    collection: "users",
    data: {
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      roles: ["super-admin"],
    },
  });

  // create tenants, use `*.localhost.com` so that accidentally forgotten changes the hosts file are acceptable
  const [abc] = await Promise.all([
    await payload.create({
      collection: "tenants",
      data: {
        name: "ABC",
        domains: [{ domain: `abc.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}` }],
      },
    })
  ]);

  // create tenant-scoped admins and users
  await Promise.all([
    await payload.create({
      collection: "users",
      data: {
        email: "admin@abc.com",
        password: "test",
        roles: ["user"],
        tenants: [
          {
            tenant: abc.id,
            roles: ["admin"],
          },
        ],
      },
    }),
    await payload.create({
      collection: "users",
      data: {
        email: "user@abc.com",
        password: "test",
        roles: ["user"],
        tenants: [
          {
            tenant: abc.id,
            roles: ["user"],
          },
        ],
      },
    })
  ]);

  // create tenant-scoped posts

};
