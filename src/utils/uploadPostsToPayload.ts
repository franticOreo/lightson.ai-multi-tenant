import { getInstagramPosts } from './instagramFunctions'; 
import { generateRemainingBusinessDetails } from './createBusinessDetails';
import { postsCreationPipeline } from './postCreation';
import { createTenant, assignTenantToUser } from './tenantUserManagement';
import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';
import { io } from '../server';

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

async function handleBusinessDetailsUpdate(payloadUserId: string, businessDetailsData: any, instagramHandle: string): Promise<any> {
  console.log(businessDetailsData)
  const serviceArea = businessDetailsData.docs[0].serviceArea || 'No location provided';

  const remainingDetails = await generateRemainingBusinessDetails(instagramHandle, serviceArea);
  console.log('remainingDetails', remainingDetails);

  const keywords = remainingDetails.SEO_keywords;
  const newBusinessData = {
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

async function handlePostCreation(nPosts: number, instagramHandle: string, updatedBusinessDetails: any, tenantDetails: any): Promise<void> {
  //// need to get posts with Hiker API.
  const posts = await getInstagramPosts(instagramHandle);
  const recentPosts = posts.slice(0, nPosts);

  const updatedBusinessKeywordsString = updatedBusinessDetails.keywords.map((kw: { keyword: string }) => kw.keyword).join(', ');

  const postsResponse = postsCreationPipeline({
    posts: recentPosts,
    clientBusinessBio: updatedBusinessDetails.businessBio,
    clientLanguageStyle: updatedBusinessDetails.languageStyle,
    clientServiceArea: updatedBusinessDetails.serviceArea,
    clientKeywords: updatedBusinessKeywordsString,
    instagramHandle: updatedBusinessDetails.instagramHandle,
    userId: tenantDetails.userId,
    tenantId: tenantDetails.tenantId,
  });
}

export default async function uploadInitialPostsToPayload(payloadUserId: string, instagramHandle: string, nPosts: number): Promise<void> {
  try {
    // const instagramProfileData = await getInstagramProfileByUserId(payloadUserId);
    const businessDetailsData = await getBusinessDetailsByUserId(payloadUserId);

    console.log('uploadInitialPostsToPayload')
    io.emit('test', 'herrro from uploadInitialPostsToPayload')


    // const tenantDetails = await handleTenantCreation(payloadUserId, instagramHandle);
    // const updatedBusinessDetails = await handleBusinessDetailsUpdate(payloadUserId, businessDetailsData, instagramHandle);
    // const postCreationResponse = await handlePostCreation(nPosts, instagramHandle, updatedBusinessDetails, tenantDetails);

    // console.log(updatedBusinessDetails)

    // const envVariables = [
    //   // Fixed .env vars.
    //   { key: "SENDGRID_API_KEY", value: process.env.SENDGRID_API_KEY || '', target: ["production"], type: "sensitive" },
    //   { key: "GOOGLE_MAPS_API_KEY", value: process.env.GOOGLE_MAPS_API_KEY || '', target: ["production"], type: "sensitive" },
    //   { key: "NEXT_PUBLIC_DOMAIN", value: process.env.NEXT_PUBLIC_DOMAIN, target: ["production"], type: "plain" },
    //   { key: "POSTS_API_KEY", value: process.env.POSTS_API_KEY || '', target: ["production"], type: "plain" },
    //   // Variable .env vars.
    //   { key: "BUSINESS_NAME", value: updatedBusinessDetails.businessName || '', target: ["production"], type: "plain" },
    //   { key: "INSTAGRAM_HANDLE", value: instagramHandle, target: ["production"], type: "plain" },
    //   { key: "BUSINESS_BIO", value: updatedBusinessDetails.businessBio || '', target: ["production"], type: "plain" },
    //   { key: "BUSINESS_ADDRESS", value: updatedBusinessDetails.businessAddress || '', target: ["production"], type: "plain" },
    //   { key: "BUSINESS_SERVICE_AREA", value: updatedBusinessDetails.serviceArea || '', target: ["production"], type: "plain" },
    //   { key: "BUSINESS_PHONE_NUMBER", value: updatedBusinessDetails.phoneNumber || '', target: ["production"], type: "plain" },
    //   { key: "BUSINESS_EMAIL", value: updatedBusinessDetails.email || '', target: ["production"], type: "plain" },
    //   { key: "BUSINESS_OPERATING_HOURS", value: updatedBusinessDetails.operatingHours || '', target: ["production"], type: "plain" },
    //   { key: "PRIMARY_COLOR", value: updatedBusinessDetails.primaryColor || '', target: ["production"], type: "plain" },
    //   { key: "SECONDARY_COLOR", value: updatedBusinessDetails.secondaryColor || '', target: ["production"], type: "plain" },
    //   { key: "AUTHOR_ID", value: payloadUserId, target: ["production"], type: "plain" },
    // ];

    // console.log('Env variables', envVariables)

    // const branchName = process.env.APP_ENV === 'development' ? `dev-${instagramHandle}` : `${instagramHandle}`;
    // const projectName = branchName;


    // const projectDeploymentResponse = await setupProjectAndDeploy(branchName, projectName, envVariables)

    // // format for domain url for project is: branchName-projectName.vercel.app
    // const domainUrl = `${branchName}.vercel.app`;


    // console.log('TEST: projectDeploymentResponse.project.id', projectDeploymentResponse.project.id)
    // const deploymentData = {
    //   vercelProjectId: projectDeploymentResponse.project.id,
    //   projectDeploymentURL: projectDeploymentResponse.url,
    //   projectDomainURL: domainUrl
    // }

    // // update business details with projectDeploymentURL
    // const updatedDeploymentDetails = await updateBusinessDetails(payloadUserId, deploymentData)
    // console.log('updatedDeploymentDetails', updatedDeploymentDetails)

  } catch (error) {
    console.error('Error in uploadInitialPostsToPayload:', error);
    throw error;
  }
}