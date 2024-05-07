import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import FormData from 'form-data';
import payload from 'payload';
import fs from 'fs';

import { v4 as uuidv4 } from 'uuid'; // Ensure you have 'uuid' installed (`npm install uuid`)


export async function getInstagramHandle(accessToken: string) {
    try {
        const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        const data = await response.json();
        console.log('Response from Instagram API:', data);
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// export async function takeUserProfileScreenshot(instagramUrl: string, instagramHandle: string): Promise<Buffer> {
//   try {
//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();
//       await page.goto(instagramUrl);
//       await page.setViewport({ width: 1920, height: 1080 });
//       await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for the page to load
      
//       // Take a screenshot and get it as a buffer instead of writing to a file
//       const screenshotBuffer = await page.screenshot({ 
//           encoding: "binary", // Ensures the screenshot is returned as a Buffer
//           clip: { x: 1920 * 0.2, y: 1080 * 0.05, width: 1920 * 0.6, height: 1080 * 0.85 } 
//       });
//       console.log('Profile URL:', instagramUrl)
//       await browser.close();
//       console.log(`Screenshot for ${instagramHandle} taken successfully.`);

//       return screenshotBuffer;
//   } catch (error) {
//       console.error(`Failed to take screenshot for ${instagramHandle}: ${error}`);
//       throw error;
//   }
// }



puppeteer.use(StealthPlugin());

export async function takeUserProfileScreenshot(instagramUrl: string, instagramHandle: string): Promise<Buffer> {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add these args for better compatibility in cloud environments
        });
        const page = await browser.newPage();
        await page.goto(instagramUrl);
        await page.setViewport({ width: 1920, height: 1080 });
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for the page to load

        const screenshotBuffer = await page.screenshot({
            encoding: "binary", // Ensures the screenshot is returned as a Buffer
            clip: { x: 1920 * 0.2, y: 1080 * 0.05, width: 1920 * 0.6, height: 1080 * 0.85 }
        });
        console.log('Profile URL:', instagramUrl)
        await browser.close();
        console.log(`Screenshot for ${instagramHandle} taken successfully.`);

        return screenshotBuffer;
    } catch (error) {
        console.error(`Failed to take screenshot for ${instagramHandle}: ${error}`);
        throw error;
    }
}


export async function getInstagramPosts(INSTAGRAM_TOKEN: string) {
    // Set up the API endpoint and access token
    const api_url = "https://graph.instagram.com/me/media";

    // Set up the API parameters
    const params = {
        "fields": "id,caption,media_url,timestamp,media_type,permalink",
        "access_token": INSTAGRAM_TOKEN
    };

    try {
        // Make a GET request to the API endpoint
        const response = await axios.get(api_url, { params });

        // Check if the request was successful
        if (response.status === 200) {
            // Access the retrieved data
            const data = response.data;
            const posts = data.data;

            const imagePosts = posts.filter(post => post.media_type === "IMAGE");
            return imagePosts;
        } else {
            console.log("Failed to retrieve data from the Instagram Display API.");
        }
    } catch (error) {
        console.error("Error retrieving data from the Instagram Display API:", error);
    }
}



export async function getPayloadAuthToken() {
    const payloadUrl = process.env.NEXT_PUBLIC_DOMAIN
    try {
      const req = await fetch(`${payloadUrl}/api/users/login`, {
        method: "POST", 
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: process.env.SUPER_ADMIN_EMAIL,
          password: process.env.SUPER_ADMIN_PASSWORD
        }),
      });
  
      if (!req.ok) { // Check if the response status is not OK
        throw new Error(`Server responded with a non-OK status: ${req.status}`);
      }
  
      const data = await req.json();
      console.log(data);
      return data.token;
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


  export async function uploadImageToCollection(imageBuffer: Buffer, instagramHandle: string, accessToken: string) {
    try {
      const uniqueId = uuidv4();
      const tempImagePath = `./temp_${instagramHandle}_${uniqueId}.jpg`; // Now includes a UUID

      fs.writeFileSync(tempImagePath, imageBuffer);
  
      // Prepare the form data for upload
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempImagePath));
      formData.append('alt', instagramHandle);
  
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
  
      console.log('Media uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error; // Rethrow or handle as needed
    }
  }

  

interface InstagramProfileData {
  payloadUserId: string;
  instagramUserId: string;
  instagramHandle: string;
  accessToken: string;
}

export async function createInstagramProfileEntry(profileData: InstagramProfileData) {
  try {
    const newProfile = await payload.create({
      collection: 'instagramProfiles',
      data: profileData,
    });
    console.log('New Instagram Profile created:', newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error creating Instagram Profile:', error);
    throw error;
  }
}