import { updateBranchFromMain } from "./gitHub";

const teamId = process.env.VERCEL_TEAM_ID
const token = process.env.VERCEL_TOKEN

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

export const createDeployment = async (vercelProjectName, gitBranchName) => {
    const apiUrl = `https://api.vercel.com/v12/now/deployments?teamId=${teamId}`;

    const data = JSON.stringify({
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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data
    });
  
    if (!response.ok) {
      console.error('Failed to create deployment:', response.status, await response.text());
      return null;
    }
  
    const jsonResponse = await response.json();
    return jsonResponse;
  };
  
  export const setEnvironmentVariables = async (projectId, envVariables) => {
    const apiUrl = `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`;
    const token = process.env.VERCEL_TOKEN
  
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
    return jsonResponse;
  };
  
  export async function updateProjectFromMainAndDeploy(projectName: string, branchName: string) {
    const updateResult = await updateBranchFromMain('main', branchName);
  
    if (!updateResult) {
      console.error('Failed to update branch with latest main changes');
      return;
    }
  
    await createDeployment(projectName, branchName);
  }

// Mapping of payload fields to environment variable names
export const payloadFieldToEnvVarMap = {
    businessName: "BUSINESS_NAME",
    instagramHandle: "INSTAGRAM_HANDLE",
    aboutPage: "BUSINESS_BIO",
    serviceList: "BUSINESS_SERVICE_LIST",
    businessAddress: "BUSINESS_ADDRESS",
    serviceArea: "BUSINESS_SERVICE_AREA",
    phoneNumber: "BUSINESS_PHONE_NUMBER",
    email: "BUSINESS_EMAIL",
    operatingHours: "BUSINESS_OPERATING_HOURS",
    primaryColor: "PRIMARY_COLOR",
    secondaryColor: "SECONDARY_COLOR",
  };
  
  /**
   * Fetches the environment variables for a given Vercel project.
   * @param {string} projectId - The ID of the Vercel project.
   * @returns {Promise<Object>} - The environment variables of the project.
   */
  async function fetchEnvVars(projectId: string) {
    const accessToken = process.env.VERCEL_TOKEN;
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      console.log(`Failed: https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`)
      throw new Error(`Failed to retrieve environment variables: ${response.statusText}`);
    }
  
    return response.json();
  }
  
  /**
   * Updates a specific environment variable for a given Vercel project.
   * @param {string} projectId - The ID of the Vercel project.
   * @param {string} envId - The ID of the environment variable.
   * @param {string} value - The new value for the environment variable.
   * @param {string[]} target - The target environments (e.g., ["production"]).
   */
  async function updateEnvVar(projectId: string, envVarId: string, value: string, target: string[]) {
    const accessToken = process.env.VERCEL_TOKEN;
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${envVarId}?teamId=${teamId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value,
        target
      })
    });
  
    if (!response.ok) {
      throw new Error(`Failed to update environment variable: ${response.statusText}`);
    }
  }
  
  /**
   * Updates multiple environment variables for a given Vercel project.
   * @param {string} projectId - The ID of the Vercel project.
   * @param {Object[]} newEnvVars - An array of new environment variables to update.
   */
  export async function updateEnvVars(projectId: string, newEnvVars: { key: string, value: string }[]) {
    const existingEnvs = await fetchEnvVars(projectId);
  
    for (const newEnvVar of newEnvVars) {
      const existingEnvVar = existingEnvs.envs.find(e => e.key === newEnvVar.key);
      if (existingEnvVar) {
        await updateEnvVar(projectId, existingEnvVar.id, newEnvVar.value, existingEnvVar.target);
        console.log(`Environment variable ${newEnvVar.key} updated successfully`);
      } else {
        console.warn(`Environment variable ${newEnvVar.key} not found`);
  
        const newEnvVarFullFormat = [{
          key: newEnvVar.key,
          value: newEnvVar.value,
          target: ["production"],
          type: "plain"
        }]
  
        setEnvironmentVariables(projectId, newEnvVarFullFormat)
      }
    }
  
    console.log('Environment variables updated successfully');
  }

export async function getProjectProductionURL(deploymentId: string): Promise<string> {
    const headers = {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    };
  
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, { headers });
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(`Error fetching deployments: ${data.error.message}`);
    }

    if (!data) {
      throw new Error('No production deployment found');
    }
  
    return data.url;
  }