import axios from 'axios';
import FormData from 'form-data';
import payload from 'payload';
import fs from 'fs';

import { v4 as uuidv4 } from 'uuid'; 
import { fetchInstagramData } from './instagramBio'; 

import dotenv from 'dotenv';

dotenv.config();


export async function getInstagramHandle(accessToken: string) {
    try {
        const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        const data = await response.json();
        console.log('Response from Instagram API:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
        // throw error;

    }
}

export async function getInstagramPosts(instagramHandle: string) {

    const instagramData = await fetchInstagramData(instagramHandle);

    const posts = instagramData.graphql.user.edge_owner_to_timeline_media.edges;
    return posts.map((post: any) => {
        let displayUrl = post.node.display_url;
        const captionText = post.node.edge_media_to_caption.edges.length > 0 ? post.node.edge_media_to_caption.edges[0].node.text : '';

        // Check if the post is a carousel and extract the first image URL
        if (post.node.__typename === "GraphSidecar" && post.node.edge_sidecar_to_children.edges.length > 0) {
            displayUrl = post.node.edge_sidecar_to_children.edges[0].node.display_url;
        }

        return { media_url: displayUrl, caption: captionText };
    });

}

export async function loginUser(email: string, password: string, admin: boolean = false) {
  const payloadUrl = process.env.NEXT_PUBLIC_DOMAIN;
  const loginEmail = admin ? process.env.SUPER_ADMIN_EMAIL : email;
  const loginPassword = admin ? process.env.SUPER_ADMIN_PASSWORD : password;

  try {
    const req = await fetch(`${payloadUrl}/api/users/login`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      }),
    });

    if (!req.ok) { // Check if the response status is not OK
      throw new Error(`Server responded with a non-OK status: ${req.status}`);
    }

    const data = await req.json();
    return data
  } catch (err) {
    console.error(err);
    throw err; // It's generally a good idea to rethrow the error after logging it
  }
}

  export async function downloadImageToMemory(url: string) {
    console.log(`Starting download of image from URL: ${url}`); // Log before starting the download
    const startTime = Date.now(); // Capture start time for performance measurement
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer', // Set the response type to 'arraybuffer' to get the response data as a Buffer
        });

        const endTime = Date.now(); // Capture end time
        console.log(`Image downloaded successfully from URL: ${url}. Time taken: ${endTime - startTime}ms`); // Log success and time taken

        return Buffer.from(response.data, 'binary'); // Convert the response data to a Buffer
    } catch (error) {
        console.error(`Failed to download image from URL: ${url}. Error: ${error}`); // Log error
        throw error; // Rethrow the error after logging
    }
}


  export async function uploadImageToCollection(imageBuffer: Buffer, imageTitle: string, accessToken: string, makeUnique: boolean = true, description: string = '') {
    try {
      const uniqueId = makeUnique ? uuidv4() : "";
      const tempImagePath = `./${imageTitle}_${uniqueId}.jpg`; // Now includes a UUID

      fs.writeFileSync(tempImagePath, imageBuffer);
  
      // Prepare the form data for upload
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempImagePath));
      formData.append('alt', imageTitle);
      formData.append('description', description);
  
      // Perform the upload
      const response = await axios({
        method: 'post',
        url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/media`, // Replace with your actual Payload upload endpoint
        data: formData,
        headers: { 
          ...formData.getHeaders(),
          'Authorization': `Bearer ${accessToken}` // Replace with your actual access token
        },
      });
  
      // Optionally, delete the temporary file after upload
      fs.unlinkSync(tempImagePath);
  
      return response.data;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error; // Rethrow or handle as needed
    }
  }
