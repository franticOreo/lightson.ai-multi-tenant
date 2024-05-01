import payload from 'payload';

export async function createTenant(clientInstagramHandle: string) {
  console.log(`Creating tenant for Instagram handle: ${clientInstagramHandle}`);
  try {
    const result = await payload.create({
      collection: "tenants",
      data: {
        name: clientInstagramHandle,
        domains: [{ domain: `${clientInstagramHandle}.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}` }],
      },
    });
    console.log(`Tenant created successfully: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`Error creating tenant: ${error}`);
    throw error;
  }
}

export async function createUser(clientEmail: string, password: string) {
  console.log(`Creating user with email: ${clientEmail}`);
  try {
    const result = await payload.create({
      collection: "users",
      data: {
        email: clientEmail,
        password: password,
        roles: ["user"],
      },
    });
    console.log(`User created successfully: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`Error creating user: ${error}`);
    throw error;
  }
}

export async function assignTenantToUser(userId: string, tenantId: string) {
  console.log(`Assigning tenant ${tenantId} to user ${userId}`);
  try {
    const result = await payload.update({
      collection: 'users',
      id: userId,
      data: {
        tenants: [
          {
            tenant: tenantId,
            roles: ["admin"],
          },
        ],
      },
    });
    console.log(`Tenant assigned successfully: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`Error assigning tenant to user: ${error}`);
    throw error;
  }
}