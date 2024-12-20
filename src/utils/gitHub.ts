import dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';
import { createDeployment, setEnvironmentVariables } from './vercel';

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
  
export async function updateBranchFromMain(mainBranch, featureBranch) {
    const gitToken = process.env.GITHUB_TOKEN
    // Fetch the latest commit from main branch
    const mainSha = await getLatestCommitSha(gitToken, mainBranch);
    if (!mainSha) {
      console.error('Failed to fetch latest commit SHA from main branch');
      return false;
    }
  
    // Merge main branch into feature branch
    return await mergeBranches(gitToken, mainSha, featureBranch);
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

export default async function setupProjectAndDeploy(projectName, branchName, envVariables) {

  // Create either production branch or a dev branch
  const createBranchResult = await createBranch(branchName)
  // Fetch and merge updates from 'main' to 'ayres-construction' before deploying
  const updateResult = await updateBranchFromMain('main', branchName);

  if (!updateResult) {
    console.error('Failed to update branch with latest main changes');
    return;
  }

  if (process.env.APP_ENV === 'production') {

    // Create deployment and get project ID
    const deployment = await createDeployment(projectName, branchName);
    if (!deployment) return;

    const projectId = deployment.projectId; // Assuming the response contains projectId

    await setEnvironmentVariables(projectId, envVariables);

    // Optionally trigger a new deployment if the initial one was just for setup
    const finalDeployment = await createDeployment(projectName, branchName);

    return finalDeployment;
  } else {
    console.log('Not in production, skipping Vercel deployment')
  }
}




