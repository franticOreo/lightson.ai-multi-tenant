require('dotenv').config();

// const fetch = require('node-fetch');

export const deployVercelProject = async (gitBranchName, vercelProjectName, ) => {
  const token = process.env.VERCEL_TOKEN;

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
        framework: null,
        installCommand: 'npm install', // Default install command
        buildCommand: 'next build', // Default build command for Next.js
        outputDirectory: 'public', // Default output directory for static files in Next.js
        rootDirectory: '.', // Assuming your Next.js project is in the root of your repository
      },
      target: 'production', // or 'preview'
      gitSource: {
        type: 'github',
        ref: gitBranchName,
        repoId: '775700951'
      },
      env: {
        KEY: 'value' 
      }
    })
  });

  if (!response.ok) {
    console.error('Failed to deploy:', response.status, await response.text());
    return;
  }

  const jsonResponse = await response.json();
  console.log('Deployment response:', jsonResponse);
  return jsonResponse;
};

// deployVercelProject('your-branch-name');