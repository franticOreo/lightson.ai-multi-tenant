import { getInstagramPosts } from './instagramFunctions'; 
import { generateRemainingBusinessDetails } from './createBusinessDetails';
import { postsCreationPipeline } from './postCreation';
import { createTenant, assignTenantToUser } from './tenantUserManagement';
import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';
import setupProjectAndDeploy from './gitHub';
import { generateAboutPage } from './gpt';
import { prepareEnvVariables } from './vercel';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET as string;


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

      console.log('finding business with id: ', businessId)
   

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

async function handleTenantCreation(payloadUserId: string, instagramHandle: string): Promise<any> {
  console.log('Creating Tenant');
  const createdTenant = await createTenant(instagramHandle);
  console.log('Assigning Tenant to User');
  const createdUser = await assignTenantToUser(payloadUserId, createdTenant.id);
  return {
    tenantId: createdTenant.id,
    userId: createdUser.id
  };
}

async function handleBusinessDetailsUpdate(payloadUserId: string, businessDetailsData: any, instagramHandle: string, tenantId: string): Promise<any> {
  console.log(businessDetailsData)
  const serviceArea = businessDetailsData.docs[0].serviceArea || 'No location provided';

  const remainingDetails = await generateRemainingBusinessDetails(instagramHandle, serviceArea);
  console.log('remainingDetails', remainingDetails);

  const keywords = remainingDetails.SEO_keywords;
  const newBusinessData = {
    tenant: tenantId,
    instagramHandle,
    businessBio: remainingDetails.business_bio,
    languageStyle: remainingDetails.language_style,
    keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
    primaryColor: remainingDetails.PRIMARY_COLOR,
    secondaryColor: remainingDetails.SECONDARY_COLOR
  };

  const updatedBusinessObj = await updateBusinessDetails(payloadUserId, newBusinessData);
  return updatedBusinessObj.docs[0];
}

async function getInstagramPostsAndPostToPayload(nPosts: number, instagramHandle: string, updatedBusinessDetails: any, tenantDetails: any): Promise<any> {
  //// need to get posts with Hiker API.
  const posts = await getInstagramPosts(instagramHandle);
  const recentPosts = posts.slice(0, nPosts);

  const updatedBusinessKeywordsString = updatedBusinessDetails.keywords.map((kw: { keyword: string }) => kw.keyword).join(', ');

  const postsResponse = await postsCreationPipeline({
    posts: recentPosts,
    clientBusinessBio: updatedBusinessDetails.businessBio,
    clientLanguageStyle: updatedBusinessDetails.languageStyle,
    clientServiceArea: updatedBusinessDetails.serviceArea,
    clientKeywords: updatedBusinessKeywordsString,
    instagramHandle: updatedBusinessDetails.instagramHandle,
    userId: tenantDetails.userId,
    tenantId: tenantDetails.tenantId,
  });

  return postsResponse; 
}

export default async function uploadInitialPostsToPayload(payloadUserId: string, instagramHandle: string, nPosts: number): Promise<void> {
  try {
    ///
    const businessDetailsData = await getBusinessDetailsByUserId(payloadUserId);

    console.log('uploadInitialPostsToPayload')

    const tenantDetails = await handleTenantCreation(payloadUserId, instagramHandle);
    const tenantId = tenantDetails.tenantId;

    const updatedBusinessDetails = await handleBusinessDetailsUpdate(payloadUserId, businessDetailsData, instagramHandle, tenantId);
    const postCreationResponse = await getInstagramPostsAndPostToPayload(nPosts, instagramHandle, updatedBusinessDetails, tenantDetails);

    const postUnderstandings = postCreationResponse.postUnderstandings;
    console.log('postUnderstandings', postUnderstandings)

    const aboutPageServices = await generateAboutPage(updatedBusinessDetails, postUnderstandings);

    // add aboutPage and serviceList
    const updatedBusinessDetailsAgain = await updateBusinessDetails(payloadUserId, aboutPageServices)

    console.log('added about page and service list to business details')

    const branchName = process.env.APP_ENV === 'development' ? `de\v-${instagramHandle}` : `${instagramHandle}`;
    const projectName = branchName;

    const envVariables = prepareEnvVariables(updatedBusinessDetailsAgain)
    console.log('Env variables', envVariables)

    // setup vercel project using a branch of the main branch from lightson_template
    const projectDeploymentResponse = await setupProjectAndDeploy(branchName, projectName, envVariables)

    // format for domain url for project is: branchName-projectName.vercel.app
    const domainUrl = `${branchName}.vercel.app`;

    // Only set deployment data to business collection if running in production.
    if (process.env.APP_ENV === 'production') {
      console.log('TEST: projectDeploymentResponse.project.id', projectDeploymentResponse.project.id)
      const deploymentData = {
        vercelProjectId: projectDeploymentResponse.project.id,
        projectDeploymentURL: projectDeploymentResponse.url,
        projectDomainURL: domainUrl
      } 

      // update business details with projectDeploymentURL
      const updatedDeploymentDetails = await updateBusinessDetails(payloadUserId, deploymentData)
      console.log('updatedDeploymentDetails', updatedDeploymentDetails)
    }

  } catch (error) {
    console.error('Error in uploadInitialPostsToPayload:', error);
    throw error;
  }
}