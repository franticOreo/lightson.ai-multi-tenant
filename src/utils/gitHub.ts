import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

export const createBranch = async (branchName, sourceBranch = 'main') => {
    const token = process.env.GITHUB_TOKEN;
    const apiUrl = `https://api.github.com/repos/franticOreo/lightson_template/git/refs`;
  
    // Get SHA of the latest commit to the source branch
    const response = await fetch(`${apiUrl}/heads/${sourceBranch}`, {
      headers: { 'Authorization': `token ${token}` }
    });

    console.log(token)
    if (!response.ok) {
        console.error('Failed to fetch source branch:', response.status, await response.text());
        return;
    }
    const jsonResponse = await response.json();
    console.log('Response JSON:', jsonResponse); // Log the full JSON response

    if (!jsonResponse || !jsonResponse.object) {
        console.error('Invalid JSON response or missing "object" key:', jsonResponse);
        return;
    }
    const sha = jsonResponse.object.sha;
    console.log('SHA:', sha); // Log the SHA
  
    // Create new branch from the SHA
    const createResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: sha
      })
    });

    if (!createResponse.ok) {
        console.error('Failed to create branch:', createResponse.status, await createResponse.text());
        return;
    }
    const createResponseJson = await createResponse.json();
    console.log('Create branch response:', createResponseJson); // Log the response of the create branch request
  
    return createResponseJson;
  };

  // async function foo() {
  //   const token = process.env.VERCEL_TOKEN;
  //   const projectName = 'ayres-construction';
  //   const branchName = 'ayres-construction';
  

  
  //   // Create deployment and get project ID
  //   const deployment = await createDeployment(token, projectName, branchName);
  //   if (!deployment) return;
  
  //   const projectId = deployment.projectId; // Assuming the response contains projectId
  
  //   // Set environment variables
  //   const envVariables = [
  //     // Your environment variables here
  //   ];
  //   await setEnvironmentVariables(token, projectId, envVariables);
  
  //   // Optionally trigger a new deployment if the initial one was just for setup
  //   await triggerNewDeployment(token, projectName, branchName);
  // }
  
  async function updateBranchFromMain(token, mainBranch, featureBranch) {
    // Fetch the latest commit from main branch
    const mainSha = await getLatestCommitSha(token, mainBranch);
    if (!mainSha) {
      console.error('Failed to fetch latest commit SHA from main branch');
      return false;
    }
  
    // Merge main branch into feature branch
    return await mergeBranches(token, mainSha, featureBranch);
  }
  
  async function getLatestCommitSha(token, branch) {
    const apiUrl = `https://api.github.com/repos/franticOreo/lightson_template/git/refs/heads/${branch}`;
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}` }
    });
    if (!response.ok) {
      console.error('Failed to fetch branch info:', response.status, await response.text());
      return null;
    }
    const jsonResponse = await response.json();
    return jsonResponse.object.sha;
  }
  
  async function mergeBranches(token, sha, branch) {
    const apiUrl = `https://api.github.com/repos/franticOreo/lightson_template/git/refs/heads/${branch}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sha: sha })
    });
    if (!response.ok) {
      console.error('Failed to merge branches:', response.status, await response.text());
      return false;
    }
    return true;
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
        buildCommand: 'next build', // Default build command for Next.js
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
  console.log('Deployment created:', jsonResponse);
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

export const triggerNewDeployment = async (token, vercelProjectName, gitBranchName) => {
  return await createDeployment(token, vercelProjectName, gitBranchName);
};

export default async function setupProjectAndDeploy(projectName, branchName, envVariables) {
  const vercelToken = process.env.VERCEL_TOKEN;
  const gitToken = process.env.GITHUB_TOKEN

  const createBranchResult = await createBranch(branchName)

  // Fetch and merge updates from 'main' to 'ayres-construction' before deploying
  const updateResult = await updateBranchFromMain(gitToken, 'main', branchName);
  console.log(updateResult)

  if (!updateResult) {
    console.error('Failed to update branch with latest main changes');
    return;
  }

  // Create deployment and get project ID
  const deployment = await createDeployment(vercelToken, projectName, branchName);
  if (!deployment) return;

  const projectId = deployment.projectId; // Assuming the response contains projectId

  await setEnvironmentVariables(vercelToken, projectId, envVariables);

  // Optionally trigger a new deployment if the initial one was just for setup
  await triggerNewDeployment(vercelToken, projectName, branchName);
}


