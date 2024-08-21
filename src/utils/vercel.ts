import { updateBranchFromMain } from "./gitHub";

export function prepareEnvVariables(businessDetails: any) {
    return [
      // Fixed .env vars.
      { key: "SENDGRID_API_KEY", value: process.env.SENDGRID_API_KEY || '', target: ["production"], type: "sensitive" },
      { key: "GOOGLE_MAPS_API_KEY", value: process.env.GOOGLE_MAPS_API_KEY || '', target: ["production"], type: "sensitive" },
      { key: "NEXT_PUBLIC_DOMAIN", value: process.env.NEXT_PUBLIC_DOMAIN, target: ["production"], type: "plain" },
      { key: "POSTS_API_KEY", value: process.env.POSTS_API_KEY || '', target: ["production"], type: "plain" },
      // Variable .env vars.
      { key: "BUSINESS_NAME", value: businessDetails.businessName || '', target: ["production"], type: "plain" },
      { key: "INSTAGRAM_HANDLE", value: businessDetails.instagramHandle, target: ["production"], type: "plain" },
      // NEEDS TO BE CHANGED TO ABOUT PAGE.
      { key: "BUSINESS_BIO", value: businessDetails.aboutPage || '', target: ["production"], type: "plain" },
      { key: "BUSINESS_SERVICE_LIST", value: JSON.stringify(businessDetails.serviceList) || '', target: ["production"], type: "plain" },
      { key: "BUSINESS_ADDRESS", value: businessDetails.businessAddress || '', target: ["production"], type: "plain" },
      { key: "BUSINESS_SERVICE_AREA", value: businessDetails.serviceArea || '', target: ["production"], type: "plain" },
      { key: "BUSINESS_PHONE_NUMBER", value: businessDetails.phoneNumber || '', target: ["production"], type: "plain" },
      { key: "BUSINESS_EMAIL", value: businessDetails.email || '', target: ["production"], type: "plain" },
      { key: "BUSINESS_OPERATING_HOURS", value: businessDetails.operatingHours || '', target: ["production"], type: "plain" },
      { key: "PRIMARY_COLOR", value: businessDetails.primaryColor || '', target: ["production"], type: "plain" },
      { key: "SECONDARY_COLOR", value: businessDetails.secondaryColor || '', target: ["production"], type: "plain" },
      { key: "AUTHOR_ID", value: businessDetails.userId.id, target: ["production"], type: "plain" },
    ];
  }

export const createDeployment = async (token, vercelProjectName, gitBranchName) => {
    const apiUrl = `https://api.vercel.com/v12/now/deployments`;
  
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: vercelProjectName,
        projectSettings: {
          framework: 'nextjs',
          installCommand: 'npm install', // Default install command
          buildCommand: 'npm run build', // Default build command for Next.js
        },
        target: 'production', // or 'preview'
        gitSource: {
          type: 'github',
          ref: gitBranchName,
          repoId: '775700951'
        },
      })
    });
  
    if (!response.ok) {
      console.error('Failed to create deployment:', response.status, await response.text());
      return null;
    }
  
    const jsonResponse = await response.json();
    return jsonResponse;
  };
  
  export const setEnvironmentVariables = async (token, projectId, envVariables) => {
    const apiUrl = `https://api.vercel.com/v10/projects/${projectId}/env`;
  
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(envVariables)
    });
  
    if (!response.ok) {
      console.error('Failed to set environment variables:', response.status, await response.text());
      return null;
    }
  
    const jsonResponse = await response.json();
    console.log('Environment variables set:', jsonResponse);
    return jsonResponse;
  };
  
  export async function updateProjectFromMainAndDeploy(projectName: string, branchName: string) {
    const vercelToken = process.env.VERCEL_TOKEN;
    const updateResult = await updateBranchFromMain('main', branchName);
  
    if (!updateResult) {
      console.error('Failed to update branch with latest main changes');
      return;
    }
  
    const finalDeployment = await createDeployment(vercelToken, projectName, branchName);
    console.log('Deployment created:', finalDeployment);
  }