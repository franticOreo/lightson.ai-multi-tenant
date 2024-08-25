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

export async function updateCollection(collectionName: string, documentId: string, newData: any) {
  console.log(`Updating ${collectionName} document:`, documentId, newData);
  try {
    const updatedDocument = await payload.update({
      collection: collectionName as 'business' | 'users' | 'tenants' | 'posts' | 'media' | 'waitlists' | 'instagramProfiles' | 'payload-preferences' | 'payload-migrations',
      where: {
        id: {
          equals: documentId
        }
      },
      data: newData
    });

    console.log(`Updated ${collectionName} document:`, updatedDocument);
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

async function handleTenantCreation(payloadUserId: string, instagramHandle: string): Promise<any> {
  console.log('Creating Tenant');
  const createdTenant = await createTenant(instagramHandle);
  console.log('Assigning Tenant to User');
  const createdUser = await assignTenantToUser(payloadUserId, createdTenant?.id.toString());
  return {
    tenantId: createdTenant.id,
    userId: createdUser.id
  };
}

async function handleBusinessDetailsUpdate(businessId: string, businessDetailsData: any, instagramHandle: string, tenantId: string): Promise<any> {
  const serviceArea = businessDetailsData.serviceArea || 'No location provided';

  const remainingDetails = await generateRemainingBusinessDetails(instagramHandle, serviceArea);

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

  const updatedBusinessObj = await updateBusinessDetails(businessId, newBusinessData);

  return updatedBusinessObj;
}

export async function getInstagramPostsAndPostToPayload(nPosts: number, instagramHandle: string, updatedBusinessDetails: any, tenantDetails: any, payloadToken: string): Promise<any> {
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
    payloadToken
  });

  return postsResponse; 
}

export const getEnvVariables = (userId, instagramHandle, aboutPageServices, businessDetails)=>{
  return [
    // Fixed .env vars.
    { key: "SENDGRID_API_KEY", value: process.env.SENDGRID_API_KEY || '', target: ["production"], type: "sensitive" },
    { key: "GOOGLE_MAPS_API_KEY", value: process.env.GOOGLE_MAPS_API_KEY || '', target: ["production"], type: "sensitive" },
    { key: "NEXT_PUBLIC_DOMAIN", value: process.env.NEXT_PUBLIC_DOMAIN, target: ["production"], type: "plain" },
    { key: "POSTS_API_KEY", value: process.env.POSTS_API_KEY || '', target: ["production"], type: "plain" },
    // Variable .env vars.
    { key: "BUSINESS_NAME", value: businessDetails.businessName || '', target: ["production"], type: "plain" },
    { key: "INSTAGRAM_HANDLE", value: instagramHandle, target: ["production"], type: "plain" },
    // NEEDS TO BE CHANGED TO ABOUT PAGE.
    { key: "BUSINESS_BIO", value: aboutPageServices.aboutPage || '', target: ["production"], type: "plain" },
    { key: "BUSINESS_SERVICE_LIST", value: JSON.stringify(aboutPageServices.serviceList) || '', target: ["production"], type: "plain" },
    { key: "BUSINESS_ADDRESS", value: businessDetails.businessAddress || '', target: ["production"], type: "plain" },
    { key: "BUSINESS_SERVICE_AREA", value: businessDetails.serviceArea || '', target: ["production"], type: "plain" },
    { key: "BUSINESS_PHONE_NUMBER", value: businessDetails.phoneNumber || '', target: ["production"], type: "plain" },
    { key: "BUSINESS_EMAIL", value: businessDetails.email || '', target: ["production"], type: "plain" },
    { key: "BUSINESS_OPERATING_HOURS", value: businessDetails.operatingHours || '', target: ["production"], type: "plain" },
    { key: "PRIMARY_COLOR", value: businessDetails.primaryColor || '', target: ["production"], type: "plain" },
    { key: "SECONDARY_COLOR", value: businessDetails.secondaryColor || '', target: ["production"], type: "plain" },
    { key: "AUTHOR_ID", value: userId, target: ["production"], type: "plain" },
  ];
}

export const startDeployment = async (userId: string, instagramHandle: string, aboutPageServices: any, businessDetails: any) => {
  // We create .env file. This .env file is created for a next.js project. This project is a branch of a template website I have created (lightson_template)
  const envVariables = getEnvVariables(userId, instagramHandle, aboutPageServices, businessDetails)

  const branchName = process.env.APP_ENV === 'development' ? `dev-${instagramHandle}` : `${instagramHandle}`;
  const projectName = branchName;

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
    const updatedDeploymentDetails = await updateBusinessDetails(businessDetails.id, deploymentData)
  }

  return domainUrl;
}

export default async function uploadInitialPostsToPayload(payloadUserId: string, instagramHandle: string, nPosts: number, accessToken: string): Promise<void> {
  try {
    
    const result: any = await getBusinessDetailsByUserId(payloadUserId);
    
    const businessDetailsData = result.docs[0];

    const tenantDetails = await handleTenantCreation(payloadUserId, instagramHandle);
    const tenantId = tenantDetails.tenantId;

    const updatedBusinessDetails = await handleBusinessDetailsUpdate(businessDetailsData.id, businessDetailsData, instagramHandle, tenantId);
    const postCreationResponse = await getInstagramPostsAndPostToPayload(nPosts, instagramHandle, updatedBusinessDetails, tenantDetails, accessToken);

    const postUnderstandings = postCreationResponse.postUnderstandings;
    console.log('postUnderstandings', postUnderstandings)

    const aboutPageServices = await generateAboutPage(updatedBusinessDetails, postUnderstandings);

    // add aboutPage and serviceList
    const updatedBusinessDetailsAgain = await updateBusinessDetails(businessDetailsData.id, aboutPageServices)

    console.log('added about page and service list to business details')

    /// Using instagram data, transforms it with GPT and pushes the data to Payload cms
    const domainUrl = await startDeployment(payloadUserId, instagramHandle, aboutPageServices, updatedBusinessDetailsAgain);
    console.log('domainUrl', domainUrl)

  } catch (error) {
    console.error('Error in uploadInitialPostsToPayload:', error);
    throw error;
  }
}