import {getInstagramPosts, loginUser } from './instagramFunctions'; 
import { generateRemainingBusinessDetails } from './createBusinessDetails';
import { postsCreationPipeline } from './postCreation';
import { createTenant, assignTenantToUser } from './tenantUserManagement';
import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';
import setupProjectAndDeploy from './gitHub';

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

async function handleTenantCreation(payloadUserId: string, instagramProfileData: any): Promise<any> {
  console.log('Creating Tenant');
  const instagramHandle = instagramProfileData.docs[0].instagramHandle;
  const createdTenant = await createTenant(instagramHandle);
  console.log('Assigning Tenant to User');
  const createdUser = await assignTenantToUser(payloadUserId, createdTenant.id);
  return {
    tenantId: createdTenant.id,
    userId: createdUser.id
  };
}

async function handleBusinessDetailsUpdate(payloadUserId: string, businessDetailsData: any, instagramProfileData: any): Promise<any> {
  const serviceArea = businessDetailsData.docs[0].serviceArea;
  const instagramHandle = instagramProfileData.docs[0].instagramHandle;
  const remainingDetails = await generateRemainingBusinessDetails(PAYLOAD_SECRET, instagramHandle, serviceArea);
  console.log(remainingDetails);

  const keywords = remainingDetails.SEO_keywords;
  const newBusinessData = {
    instagramHandle,
    businessBio: remainingDetails.business_bio,
    languageStyle: remainingDetails.language_style,
    keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
    primaryColor: remainingDetails.primaryColor,
    secondaryColor: remainingDetails.secondaryColor
  };

  const updatedBusinessObj = await updateBusinessDetails(payloadUserId, newBusinessData);
  return updatedBusinessObj.docs[0];
}

async function handlePostCreation(nPosts: number, instagramProfileData: any, updatedBusinessDetails: any, tenantDetails: any): Promise<void> {
  const instagramAuthToken = instagramProfileData.docs[0].accessToken;
  const posts = await getInstagramPosts(instagramAuthToken);
  const recentPosts = posts.slice(0, nPosts);

  const updatedBusinessKeywordsString = updatedBusinessDetails.keywords.map((kw: { keyword: string }) => kw.keyword).join(', ');

  const postsResponse = postsCreationPipeline({
    posts: recentPosts,
    instagramToken: instagramAuthToken,
    clientBusinessBio: updatedBusinessDetails.businessBio,
    clientLanguageStyle: updatedBusinessDetails.languageStyle,
    clientServiceArea: updatedBusinessDetails.serviceArea,
    clientKeywords: updatedBusinessKeywordsString,
    instagramHandle: updatedBusinessDetails.instagramHandle,
    userId: tenantDetails.userId,
    tenantId: tenantDetails.tenantId,
  });
}

export default async function uploadInitialPostsToPayload(payloadUserId: string, nPosts: number): Promise<void> {
  try {
    const instagramProfileData = await getInstagramProfileByUserId(payloadUserId);
    const businessDetailsData = await getBusinessDetailsByUserId(payloadUserId);
    const tenantDetails = await handleTenantCreation(payloadUserId, instagramProfileData);
    const updatedBusinessDetails = await handleBusinessDetailsUpdate(payloadUserId, businessDetailsData, instagramProfileData);
    // const postCreationResponse = await handlePostCreation(nPosts, instagramProfileData, updatedBusinessDetails, tenantDetails);
    console.log(payloadUserId)
    const user = await getUserByUserId(payloadUserId)
    console.log('---------------------')
    console.log(user)
    console.log('---------------------')
    // const email = user.docs[0].email || ''
    // const password = user.docs[0].password || ''
    // const userLoginResponse = await loginUser(email, password, false)
    
    const apiKey = user.docs[0].apiKey

    const envVariables = [
      // Fixed .env vars.
      { key: "GOOGLE_MAPS_API_KEY", value: process.env.GOOGLE_MAPS_API_KEY, target: ["production"], type: "sensitive" },
      { key: "NEXT_PUBLIC_DOMAIN", value: process.env.NEXT_PUBLIC_DOMAIN, target: ["production"], type: "plain" },
      { key: "SENDGRID_API_KEY", value: process.env.SENDGRID_API_KEY, target: ["production"], type: "sensitive" },
      // Variable .env vars.
      { key: "BUSINESS_NAME", value: businessDetailsData.docs[0].businessName, target: ["production"], type: "plain" },
      { key: "USER_API_KEY", value: apiKey, target: ["production"], type: "sensitive" },
      
      { key: "BUSINESS_BIO", value: businessDetailsData.docs[0].businessBio, target: ["production"], type: "plain" },
      { key: "BUSINESS_ADDRESS", value: businessDetailsData.docs[0].businessAddress, target: ["production"], type: "plain" },
      { key: "BUSINESS_SERVICE_AREA", value: businessDetailsData.docs[0].serviceArea, target: ["production"], type: "plain" },
      { key: "BUSINESS_PHONE_NUMBER", value: businessDetailsData.docs[0].phoneNumber, target: ["production"], type: "plain" },
      { key: "BUSINESS_EMAIL", value: businessDetailsData.docs[0].email, target: ["production"], type: "plain" },
      { key: "BUSINESS_OPERATING_HOURS", value: businessDetailsData.docs[0].operatingHours, target: ["production"], type: "plain" },
      { key: "PRIMARY_COLOR", value: businessDetailsData.docs[0].primaryColor, target: ["production"], type: "plain" },
      { key: "SECONDARY_COLOR", value: businessDetailsData.docs[0].secondaryColor, target: ["production"], type: "plain" },
    ];

    const branchName = `${payloadUserId}-${instagramProfileData.docs[0].instagramHandle}`
    const vercelProjectName = `${payloadUserId}-${instagramProfileData.docs[0].instagramHandle}`


    const projectDeploymentResponse = await setupProjectAndDeploy(branchName, vercelProjectName, envVariables)


  } catch (error) {
    console.error('Error in uploadInitialPostsToPayload:', error);
    throw error;
  }
}

// Example of how to trigger getUserByUserId function to see what it returns
async function testGetUserByUserId() {
  const userId = '6656a477bf0593a948893c18';
  try {
    const user = await getUserByUserId(userId);
    console.log('User details:', user);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

testGetUserByUserId();