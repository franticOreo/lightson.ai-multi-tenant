import fetch from 'node-fetch'; // If needed
import { URLSearchParams } from 'url';
import { Request, Response } from 'express';
import { getUserProfile, takeUserProfileScreenshot, getInstagramPosts, getPayloadAuthToken, uploadImageToCollection, downloadImageToMemory} from './instagramFunctions'; 
import jwt from 'jsonwebtoken';

export async function handleInstagramCallback(req: Request, res: Response) {
  const userToken = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
  if (!userToken) return res.status(401).send({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    // Proceed with the userId
  } catch (error) {
    return res.status(401).send({ error: 'Invalid or expired token' });
  }


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

    const instagramAuthData = await response.json();
    console.log(instagramAuthData)

    if (instagramAuthData.access_token) {

      await uploadInstagramPost(instagramAuthData.access_token, userId)
      
    } else {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadInstagramPost(instagramToken: string, userId: string) {
  const instagramHandle = await getUserProfile(instagramToken);
  takeUserProfileScreenshot(`https://www.instagram.com/${instagramHandle}`, instagramHandle);
  const posts = await getInstagramPosts(instagramToken);

  for (const post of posts) {
    if (post.media_type === 'IMAGE') {
      
      
      const payloadToken = await getPayloadAuthToken()
      const image = await downloadImageToMemory(post.media_url);
      const imageUploadResponse = await uploadImageToCollection(image, instagramHandle, payloadToken)
 
      const postTitle = 'Hardcoded Title'
      const postExcerpt = 'Hardcoded Excerpt'

      const postEntryData = {
      title: postTitle || 'Default Title',
      excerpt: postExcerpt,
      date: new Date().toISOString(),
      coverImage: [
        {
          blockType: 'MediaBlock', // Assuming this is the correct block type name
          blockName: 'Cover Image', // Optional, depending on your Payload configuration
          media: imageUploadResponse.id // or whatever the correct reference is
        }
      ],
      author: userId
    };
      

      break; // Stop iterating over the array
    }
  }


}


