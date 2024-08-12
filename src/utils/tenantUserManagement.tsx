import payload from 'payload';

export async function createTenant(clientInstagramHandle: string) {
  console.log(`Creating tenant for Instagram handle: ${clientInstagramHandle}`);
  
  // Replace '.' and '_' with '-' in the clientInstagramHandle
  const sanitizedHandle = clientInstagramHandle.replace(/[._]/g, '');
  
  try {
    const result = await payload.create({
      collection: "tenants",
      data: {
        name: sanitizedHandle,
        domains: [{ domain: `${sanitizedHandle}.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}` }],
      },
    });
    console.log(`Tenant created successfully: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`Error creating tenant: ${error}`);
    throw error;
  }
}

import crypto from 'crypto';

export async function createUser(clientEmail: string, password?: string) {
  console.log(`Creating user with email: ${clientEmail}`);

  // Generate a random password if none is provided
  if (!password) {
    // TODO: FOR PRODUCTION
    // password = crypto.randomBytes(16).toString('hex');
    password = 'testy'
    console.log(`Generated password for ${clientEmail}: ${password}`);
  }

  const existingUser = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: clientEmail
      }
    }
  });

  if (existingUser.docs.length > 0) {
    throw new Error('User already exists with this email');
  }

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

export async function tenantExists(subdomain: string): Promise<boolean> {
  try {
    const result = await payload.find({
      collection: 'tenants',
      where: {
        name: {
          equals: subdomain
        }
      }
    });

    return result.docs.length > 0;
  } catch (error) {
    console.error(`Error checking tenant existence: ${error}`);
    throw error;
  }
}