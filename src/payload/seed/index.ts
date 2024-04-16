import type { Payload } from "payload";

export const seed = async (payload: Payload): Promise<void> => {
  // create super admin
  await payload.create({
    collection: "users",
    data: {
      email: "demo@payloadcms.com",
      password: "demo",
      roles: ["super-admin"],
    },
  });

  // create tenants, use `*.localhost.com` so that accidentally forgotten changes the hosts file are acceptable
  const [abc, bbc, cbc] = await Promise.all([
    await payload.create({
      collection: "tenants",
      data: {
        name: "ABC",
        domains: [{ domain: "abc.localhost.com:3000" }],
      },
    }),
    await payload.create({
      collection: "tenants",
      data: {
        name: "BBC",
        domains: [{ domain: "bbc.localhost.com:3000" }],
      },
    }),
    await payload.create({
      collection: "tenants",
      data: {
        name: "CBC",
        domains: [{ domain: "cbc.localhost.com:3000" }],
      },
    }),
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
    }),
    await payload.create({
      collection: "users",
      data: {
        email: "admin@bbc.com",
        password: "test",
        roles: ["user"],
        tenants: [
          {
            tenant: bbc.id,
            roles: ["admin"],
          },
        ],
      },
    }),
    await payload.create({
      collection: "users",
      data: {
        email: "user@bbc.com",
        password: "test",
        roles: ["user"],
        tenants: [
          {
            tenant: bbc.id,
            roles: ["user"],
          },
        ],
      },
    }),
    await payload.create({
      collection: "users",
      data: {
        email: "admin@cbc.com",
        password: "test",
        roles: ["user"],
        tenants: [
          {
            tenant: cbc.id,
            roles: ["admin"],
          },
        ],
      },
    }),
  ]);

  // create tenant-scoped posts
  // await Promise.all([
  //   await payload.create({
  //     collection: "posts",
  //     data: {
  //       tenant: abc.id,
  //       title: "ABC Home",
  //       date: new Date(),
  //       richText: [
  //         {
  //           text: "Hello, ABC!",
  //         },
  //       ],
  //     },
  //   }),
  //   await payload.create({
  //     collection: "posts",
  //     data: {
  //       title: "BBC Home",
  //       tenant: bbc.id,
  //       date: new Date(),
  //       richText: [
  //         {
  //           text: "Hello, BBC!",
  //         },
  //       ],
  //     },
  //   }),
  // ]);
};
