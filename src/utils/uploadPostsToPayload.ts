import {getInstagramPosts } from './instagramFunctions'; 
import { generateRemainingBusinessDetails } from './createBusinessDetails';
import { postsCreationPipeline } from './postCreation';
import { createTenant, assignTenantToUser } from './tenantUserManagement';
import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const { PAYLOAD_SECRET } = process.env;


async function getInstagramProfileByUserId(payloadUserId: string) {
  try {
    const result = await payload.find({
      collection: 'instagramProfiles',
      where: {
        'payloadUserId': { // Assuming the relationship field is named 'user'
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

async function getBusinessDetailsByUserId(payloadUserId: string) {
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

async function updateBusinessDetails(payloadUserId: string, newData: any) {
  try {

    // Find the business entry by userId
    const business = await payload.find({
      collection: 'business',
      where: {
        userId: {
          equals: payloadUserId
        }
      },
      limit: 1 // Assuming there's only one business per user
    });

    console.log('Found business', business)
    const businessId = business.docs[0].id;
    console.log('Business ID:', businessId);

    if (business.docs.length > 0) {
      
      
      const business = await payload.find({
        collection: 'business',
        where: {
          id: {
            equals: businessId
          }
        },
        limit: 1 // Assuming there's only one business per user
      });

      console.log('finding business with id: ', business)
   

      // Update the business entry with new data
      const updatedBusiness = await payload.update({
        collection: 'business',
        where: {
          id: {
            equals: businessId
          }
        },
        data: newData,
        user: {
          id: payloadUserId
        }
      });

      return updatedBusiness;
    } else {
      throw new Error('No business found for the given user ID');
    }
  } catch (error) {
    console.error('Error updating business details:', error);
    throw error;
  }
}


export default async function uploadInitialPostsToPayload(payloadUserId: string, nPosts: number): Promise<void> {


  const instagramProfileData = await getInstagramProfileByUserId(payloadUserId)
  const instagramHandle = instagramProfileData.docs[0].instagramHandle;
  const instagramAuthToken = instagramProfileData.docs[0].accessToken;

  console.log(instagramHandle)
  console.log(instagramAuthToken)

  const businessDetailsData = await getBusinessDetailsByUserId(payloadUserId)
  const serviceArea = businessDetailsData.docs[0].serviceArea;

  let createdTenantId: string;
  try {
    console.log('Creating Tenant')
    const createdTenant = await createTenant(instagramHandle);
    createdTenantId = createdTenant.id
    console.log('Assigning Tenant to User')
    const createdUser = await assignTenantToUser(payloadUserId, createdTenant.id);
  } catch (error) {
    console.error('Error creating User or Tenant:', error);
    throw error;
  }

  const bioLanguageKw = await generateRemainingBusinessDetails(PAYLOAD_SECRET, instagramHandle, serviceArea)
  console.log(bioLanguageKw)

  const keywords = bioLanguageKw.SEO_keywords;

  const newBusinessData = {
      instagramHandle,
      businessBio: bioLanguageKw.business_bio,
      languageStyle: bioLanguageKw.language_style,
      keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
    };
  

  const updatedBusinessObj = await updateBusinessDetails(payloadUserId, newBusinessData)
  const updatedBusiness = updatedBusinessObj.docs[0]
  const updatedBusinessKeywordsString = updatedBusiness.keywords.map(kw => kw.keyword).join(', ');

  console.log('Updated Business', updatedBusiness)

  const posts = await getInstagramPosts(instagramAuthToken)
  const recentPosts = posts.slice(0, nPosts); 

  const postsResponse = postsCreationPipeline({
                                        posts: recentPosts,
                                        instagramToken: instagramAuthToken,
                                        clientBusinessBio: updatedBusiness.businessBio,
                                        clientLanguageStyle: updatedBusiness.languageStyle,
                                        clientServiceArea: updatedBusiness.serviceArea,
                                        clientKeywords: updatedBusinessKeywordsString,
                                        instagramHandle: updatedBusiness.instagramHandle,
                                        userId: payloadUserId,
                                        tenantId: createdTenantId,
                                              });

  
  

}













//     // Create Business Details
//     if (instagramAuthData.access_token) {
//       const payloadToken = await getPayloadAuthToken()

      // const bioLanguageKw = await generateRemainingBusinessDetails(payloadToken, instagramHandle, decodedUserToken.clientServiceArea)




      

//       res.redirect('/')
      
      
//     } else {
//       return res.status(400).json({ error: 'Failed to obtain access token' });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }




