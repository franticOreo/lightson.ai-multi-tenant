import fetch from 'node-fetch'; // If needed
import { URLSearchParams } from 'url';
import { Request, Response } from 'express';
import { getUserProfile, takeUserProfileScreenshot, getInstagramPosts, getPayloadAuthToken, uploadImageToCollection, downloadImageToMemory} from './instagramFunctions'; 
import jwt from 'jsonwebtoken';
import axios from 'axios';

export function extractUserTokenFromState(state: string | undefined): string | null {
  if (!state) return null;

  try {
    const decodedState = decodeURIComponent(state);
    const parsedState = JSON.parse(decodedState);
    const userToken = parsedState.userToken;
    return userToken; // Return the JWT string directly
  } catch (error) {
    console.error('Error extracting userToken from state:', error);
    return null;
  }
}

export async function handleInstagramCallback(req: Request, res: Response) {
  const { code } = req.query;
  const userToken = extractUserTokenFromState(req.query.state as string | undefined);

  if (!userToken) {
    return res.status(400).json({ error: 'userToken is undefined or invalid' });
  }

  const decodedUserToken = jwt.decode(userToken);
  if (!decodedUserToken) {
    return res.status(400).json({ error: 'Failed to decode userToken' });
  }

  // Assuming the JWT payload contains user_id and tenant_id
  const userId = decodedUserToken.user_id;
  const tenantId = decodedUserToken.tenant_id;


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

      await uploadInstagramPost(instagramAuthData.access_token, userId, tenantId)
      
    } else {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendPostEntryDataToCollection(postEntryData: any, accessToken: string, client_instagram_handle: string) {
  try {
    const response = await axios({
      method: 'post',
      url: `http://${client_instagram_handle}.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}/api/posts`, // Adjust this URL to your post creation endpoint
      data: postEntryData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Ensure accessToken is passed correctly
      },
    });

    console.log('Post created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create post:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function uploadInstagramPost(instagramToken: string, userId: string, tenantId: string) {
  const instagramHandle = await getUserProfile(instagramToken);
  takeUserProfileScreenshot(`https://www.instagram.com/${instagramHandle}`, instagramHandle);
  const posts = await getInstagramPosts(instagramToken);

  

  for (const post of posts) {
    if (post.media_type === 'IMAGE') {
      
      
      const payloadToken = await getPayloadAuthToken()
      const image = await downloadImageToMemory(post.media_url);
      const imageUploadResponse = await uploadImageToCollection(image, instagramHandle, payloadToken)
      console.log('image response: ', imageUploadResponse)
 
      const mediaId = imageUploadResponse.doc.id;
      const postTitle = 'Hardcoded Title'
      const postExcerpt = 'Hardcoded Excerpt'

      const postEntryData = {
      title: postTitle || 'Default Title',
      excerpt: postExcerpt,
      date: new Date().toISOString(),
      coverImage: mediaId,
      author: userId,
      tenant: tenantId,
      richText: [
        {
          children: [{ text: 'having fun' }],
          type: 'h1'
        },
        {
          children: [{ text: 'hello' }]
        }
      ],
    };

    console.log(postEntryData)

    const response = await sendPostEntryDataToCollection(postEntryData, payloadToken, instagramHandle)


      break; // Stop iterating over the array
    }
  }


}


