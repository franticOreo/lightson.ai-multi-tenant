import { prepareEnvVariables, setEnvironmentVariables } from "../../../../utils/vercel";
import setupProjectAndDeploy from "../../../../utils/gitHub";

// const payloadFieldToEnvVarMap = {
//     businessName: "BUSINESS_NAME",
//     instagramHandle: "INSTAGRAM_HANDLE",
//     aboutPage: "BUSINESS_BIO",
//     serviceList: "BUSINESS_SERVICE_LIST",
//     businessAddress: "BUSINESS_ADDRESS",
//     serviceArea: "BUSINESS_SERVICE_AREA",
//     phoneNumber: "BUSINESS_PHONE_NUMBER",
//     email: "BUSINESS_EMAIL",
//     operatingHours: "BUSINESS_OPERATING_HOURS",
//     primaryColor: "PRIMARY_COLOR",
//     secondaryColor: "SECONDARY_COLOR",
//   };

// async function fetchEnvVars(projectId: string) {
//     const accessToken = process.env.VERCEL_TOKEN;
//     console.log(accessToken)
//     console.log(`https://api.vercel.com/v9/projects/${projectId}/env`)
//     const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${accessToken}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to retrieve environment variables: ${response.statusText}`);
//     }

//     return response.json();
//   }

// async function updateEnvVar(projectId: string, envId: string, value: string, target: string[]) {
//   const accessToken = process.env.VERCEL_TOKEN;
//   const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${envId}`, {
//     method: 'PATCH',
//     headers: {
//       'Authorization': `Bearer ${accessToken}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       value,
//       target
//     })
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to update environment variable: ${response.statusText}`);
//   }
// }

// async function updateEnvVars(projectId: string, newEnvVars: { key: string, value: string }[]) {
//   const existingEnvs = await fetchEnvVars(projectId);

//   for (const newEnvVar of newEnvVars) {
//     const existingEnv = existingEnvs.envs.find(e => e.key === newEnvVar.key);
//     if (existingEnv) {
//       await updateEnvVar(projectId, existingEnv.id, newEnvVar.value, existingEnv.target);
//       console.log(`Environment variable ${newEnvVar.key} updated successfully`);
//     } else {
//       console.warn(`Environment variable ${newEnvVar.key} not found`);
//     }
//   }

//   console.log('Environment variables updated successfully');
// }

//   const projectId = "prj_ubzyARdNn7nYe1ZldKfpkEbWBGVO";


//   async function fetchMostRecentDeploymentId(projectId: string) {
//     const accessToken = process.env.VERCEL_TOKEN;
//     const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${accessToken}`
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`Failed to retrieve deployments: ${response.statusText}`);
//     }

//     const data = await response.json();
//     if (data.deployments && data.deployments.length > 0) {
//         return data.deployments[0]
//     } else {
//         throw new Error('No deployments found');
//     }
// }

// async function triggerRedeployment(name: string, deploymentId: string) {
//   const accessToken = process.env.VERCEL_TOKEN;
//   const response = await fetch(`https://api.vercel.com/v13/deployments`, {
//       method: 'POST',
//       headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//           name,
//           deploymentId
//       })
//   });

//   if (!response.ok) {
//       throw new Error(`Failed to trigger redeployment: ${response.statusText}`);
//   }

//   console.log('Redeployment triggered successfully');
// }


export async function redeployProjectWithNewEnvVars({ doc, previousDoc }) {
  const projectName = doc.instagramHandle
  const branchName = projectName
  const fieldsToWatch = ['businessName', 'aboutPage', 'businessAddress',
    'serviceArea', 'phoneNumber', 'operatingHours', 'primaryColor', 'secondaryColor', 'serviceList'];

  for (const field of fieldsToWatch) {
    if (doc[field] !== previousDoc[field]) {  
      const envVars = prepareEnvVariables(doc)
      console.log('Change in Business Collection, new Env Vars: ', envVars)
      setupProjectAndDeploy(doc.instagramHandle, doc.instagramHandle, envVars)
    }
  }
}
