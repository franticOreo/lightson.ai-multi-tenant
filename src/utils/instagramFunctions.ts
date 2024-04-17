import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export async function takeUserProfileScreenshot(instagramUrl: string, instagramHandle: string): Promise<string> {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(instagramUrl);
        await page.setViewport({ width: 1920, height: 1080 });
        await new Promise(resolve => setTimeout(resolve, 10000));
        await page.screenshot({ path: `./img/screenshot_${instagramHandle}.png` });
        const screenshotPath = `./img/screenshot_${instagramHandle}.png`;
        await page.screenshot({ 
            path: screenshotPath,
            clip: { x: 1920 * 0.2, y: 1080 * 0.05, width: 1920 * 0.6, height: 1080 * 0.85 } 
        });
        await browser.close();
        console.log(`Screenshot for ${instagramHandle} saved successfully.`);
        return `./img/screenshot_${instagramHandle}.png`;
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
            return posts;
        } else {
            console.log("Failed to retrieve data from the Instagram Display API.");
        }
    } catch (error) {
        console.error("Error retrieving data from the Instagram Display API:", error);
    }
}

export async function downloadImageToMemory(url: string) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer', // Set the response type to 'arraybuffer' to get the response data as a Buffer
    });

    return Buffer.from(response.data, 'binary'); // Convert the response data to a Buffer
}


export async function uploadImageFromMemoryToCollection(image: Buffer, data: any, instagramHandle: string) {
    const formData = new FormData();

    // Append the image to the form data
    formData.append('file', image, {
        filename: 'image.jpg', // Set the filename to 'image.jpg'
        contentType: 'image/jpeg', // Set the content type to 'image/jpeg'
    });

    // Append the data to the form data
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });

    // Append the instagram handle to the form data
    formData.append('instagramHandle', instagramHandle);

    const headers = formData.getHeaders();
    const response = await axios.post(`https://localhost:3000/api/media/create`, formData, {
        headers: {
            ...headers,
            'Authorization': `Bearer your_access_token`
        }
    });

    // Check if the request was successful
    if (response.status === 200) {
        console.log('File uploaded successfully.');
    } else {
        console.log('Failed to upload file.');
    }
}