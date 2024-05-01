import path from 'path'
// require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

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

export async function testCreateBranch() {
    try {
      const result = await createBranch('new-branch-name');
      console.log('Branch created:', result);
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  }
  
  testCreateBranch();