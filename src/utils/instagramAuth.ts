import fetch from 'node-fetch'; // If needed
import { URLSearchParams } from 'url';
import { Request, Response } from 'express';
import { getUserProfile, takeUserProfileScreenshot, getInstagramPosts, getAuthToken, uploadImageToCollection, downloadImageToMemory} from './instagramFunctions'; // Adjust the import path as necessary
import { tenant } from '../payload/fields/tenant';

export async function handleInstagramCallback(req: Request, res: Response) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code not provided or is invalid' });
  }

  try {
    const clientId = '743103918004392';
    const clientSecret = '2647020baecf2da6ba40f57d151d730b';
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await response.json();
    console.log(data)

    if (data.access_token) {
      const instagramHandle = await getUserProfile(data.access_token);
      takeUserProfileScreenshot(`https://www.instagram.com/${instagramHandle}`, instagramHandle);
      const posts = await getInstagramPosts(data.access_token);

      for (const postData of posts) {
        if (postData.media_type === 'IMAGE') {
          
          const apiUrl = process.env.NEXT_PUBLIC_DOMAIN
          const token = await getAuthToken(apiUrl)
          console.log(token)
          
          const image = await downloadImageToMemory(postData.media_url);

          const tenant = 'abc'

          console.log(image)
          console.log('--------')
          const response = await uploadImageToCollection(image, postData, instagramHandle, token, tenant)
          console.log(response)
          break; // Stop iterating over the array
        }
      }

      res.redirect(307, '/');
    } else {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}