import payload from 'payload';
import crypto from 'crypto';

export async function createTenant(clientInstagramHandle: string) {
  
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
    
    return result;
  } catch (error) {
    console.error(`Error creating tenant: ${error}`);
    throw error;
  }
}



export async function createUser(email: string, password: string) {

  // Generate a random password if none is provided
  // if (!password) {
  //   // TODO: FOR PRODUCTION
  //   // password = crypto.randomBytes(16).toString('hex');
  //   password = 'testy'
  //   console.log(`Generated password for ${email}: ${password}`);
  // }

  const existingUser = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: email
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
        email,
        password,
        roles: ["user"],
      },
    });

    return result;
  } catch (error) {
    console.error(`Error creating user: ${error}`);
    throw error;
  }
}

export async function assignTenantToUser(userId: string, tenantId: string) {
  
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

// create function to get user entry from user collection by user id
async function getUserByUserId(userId: string) {
  try {
    const result = await payload.find({
      collection: 'users',
      where: {
        id: {
          equals: userId
        }
      },
      limit: 1 // Assuming there's only one business per user
    });
    return result;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}

export async function getBusinessDetailsByUserId(payloadUserId: string) {
  try {
    const result = await payload.find({
      collection: 'business',
      where: {
        'userId': { // Assuming the relationship field is named 'user'
          equals: payloadUserId
        }
      },
      depth: 1 // Adjust depth as needed to fetch related documents
    });
    return result;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}

export async function updateCollection(collectionName: string, documentId: string, newData: any) {
  
  try {
    const updatedDocument = await payload.update({
      collection: collectionName as 'business' | 'users' | 'tenants' | 'posts' | 'media' | 'waitlists' | 'payload-preferences' | 'payload-migrations',
      where: {
        id: {
          equals: documentId
        }
      },
      data: newData
    });

    return updatedDocument.docs[0];
  } catch (error) {
    console.error(`Error updating ${collectionName} document:`, error);
    throw error;
  }
}

export async function updateBusinessDetails(businessId: string, newData: any) {
  // if (Object.keys(newData).includes('keywords')){
  //   newData.keywords = Array.isArray(newData.keywords) ? newData.keywords.map(keyword => ({ keyword })) : typeof newData.keywords === 'string' ? newData.keywords.split(', ').map(keyword => ({ keyword })) : []
  // }
  try {
    return await updateCollection('business', businessId, newData);

  } catch (error) {
    console.error('Error updating business details:', error);
    throw error;
  }
}

export async function handleTenantCreation(payloadUserId: string, instagramHandle: string): Promise<any> {
  const createdTenant = await createTenant(instagramHandle);
  const createdUser = await assignTenantToUser(payloadUserId, createdTenant?.id.toString());
  return {
    tenantId: createdTenant.id,
    userId: createdUser.id
  };
}
