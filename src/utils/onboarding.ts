import { getInstagramPosts } from './instagramFunctions'; 
import { generateRemainingBusinessDetails } from './createBusinessDetails';
import { getPostsUnderstandings, postsCreationPipeline } from './postCreation';
import dotenv from 'dotenv';
import path from 'path';
import setupProjectAndDeploy from './gitHub';
import { generateAboutPage } from './gpt';
import { updateBusinessDetails, getBusinessDetailsByUserId, handleTenantCreation } from './payload';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

export async function handleBusinessDetailsUpdate(businessId: string, businessDetailsData: any, instagramHandle: string, tenantId: string): Promise<any> {
  const context = { isSignupOrOnboarding: true }
  const serviceArea = businessDetailsData.serviceArea || 'No location provided';

  const remainingDetails = await generateRemainingBusinessDetails(instagramHandle, serviceArea);

  const keywords = remainingDetails.SEO_keywords;
  const newBusinessData = {
    tenant: tenantId,
    businessBio: remainingDetails.business_bio,
    languageStyle: remainingDetails.language_style,
    keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
    primaryColor: remainingDetails.PRIMARY_COLOR,
    secondaryColor: remainingDetails.SECONDARY_COLOR
  };

  const updatedBusinessObj = await updateBusinessDetails(businessId, newBusinessData, context);

  return updatedBusinessObj;
}

export async function getInstagramPostsAndPostToPayload(nPosts: number, instagramHandle: string, updatedBusinessDetails: any, tenantDetails: any, payloadToken: string, renewPosts: boolean = true): Promise<any> {
  //// need to get posts with Hiker API.
  const posts = await getInstagramPosts(instagramHandle);
  const recentPosts = posts.slice(0, nPosts);
  let postsResponse: any = {}
  postsResponse.postUnderstandings = await getPostsUnderstandings(recentPosts)
  
  if (renewPosts) {
    const updatedBusinessKeywordsString = updatedBusinessDetails.keywords.map((kw: { keyword: string }) => kw.keyword).join(', ');

    postsResponse = await postsCreationPipeline({
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
  }

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

export const startDeployment = async (userId: string, instagramHandle: string, aboutPageServices: any, businessDetails: any): Promise<any | void> => {
  const context = { isSignupOrOnboarding: true }
  // We create .env file. This .env file is created for a next.js project. This project is a branch of a template website I have created (lightson_template)
  const envVariables = getEnvVariables(userId, instagramHandle, aboutPageServices, businessDetails)
  
  const branchName = process.env.APP_ENV === 'development' ? `dev-${instagramHandle}` : instagramHandle;
  const projectName = branchName;

  // setup vercel project using a branch of the main branch from lightson_template
  const projectDeploymentResponse = await setupProjectAndDeploy(branchName, projectName, envVariables)

  // Only set deployment data to business collection if running in production.
  if (process.env.APP_ENV === 'production') {
    // const deploymentId = projectDeploymentResponse.id;
    // const productionURL = await getProjectProductionURL(deploymentId)
    const productionURL = projectName.replace(/[^a-zA-Z0-9]/g, '') + '.vercel.app'
    
    const deploymentData = {
      vercelProjectId: projectDeploymentResponse.project.id,
      vercelDeploymentId: projectDeploymentResponse.id,
      vercelProductionURL: productionURL
    } 
    // update business details with projectDeploymentURL
    const businessDetailsWithDeployment = await updateBusinessDetails(businessDetails.id, deploymentData, context)

    if (productionURL) {
      return businessDetailsWithDeployment;
    }
  }

  return 'Project Not Deployed: Currently in local development mode.'
}


export async function setUpBusinessDetailsAndPosts(payloadUserId: string, instagramHandle: string, nPosts: number, accessToken: string): Promise<string | void> {
  const sanitizedInstagramHandle = instagramHandle.replace('.', '_').replace('@', '').toLowerCase().trim();
  
  try {
    
    const result: any = await getBusinessDetailsByUserId(payloadUserId);
    
    const businessDetailsData = result.docs[0];

    const tenantDetails = await handleTenantCreation(payloadUserId, sanitizedInstagramHandle);
    const tenantId = tenantDetails.tenantId;

    const updatedBusinessDetails = await handleBusinessDetailsUpdate(businessDetailsData.id, businessDetailsData, instagramHandle, tenantId);
    const postCreationResponse = await getInstagramPostsAndPostToPayload(nPosts, instagramHandle, updatedBusinessDetails, tenantDetails, accessToken);

    const postUnderstandings = postCreationResponse.postUnderstandings;
    console.log('postUnderstandings', postUnderstandings)

    const aboutPageServices = await generateAboutPage(updatedBusinessDetails, postUnderstandings);

    // add aboutPage and serviceList
    const updatedBusinessDetailsAgain = await updateBusinessDetails(businessDetailsData.id, aboutPageServices)
    console.log('added about page and service list to business details')    

  } catch (error) {
    console.error('Error in firstPassBusinessDetails:', error);
    throw error;
  }
}