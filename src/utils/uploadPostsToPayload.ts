import fetch from 'node-fetch'; // If needed
import { URLSearchParams } from 'url';
import { Request, Response } from 'express';
import {getInstagramPosts, getPayloadAuthToken, uploadImageToCollection, downloadImageToMemory} from './instagramFunctions'; 
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { generateRemainingBusinessDetails, createBusinessEntry } from './createBusinessDetails';

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
        code: code as string,
      }),
    });

    const instagramAuthData = await response.json();
    console.log(instagramAuthData)

    if (instagramAuthData.access_token) {
      const payloadToken = await getPayloadAuthToken()

      const bioLanguageKw = await generateRemainingBusinessDetails(payloadToken, decodedUserToken.client_instagram_handle, decodedUserToken.clientServiceArea)

      const keywords = bioLanguageKw.SEO_keywords;

      const businessDetails = {
          clientName: decodedUserToken.client_name,
          instagramHandle: decodedUserToken.client_instagram_handle,
          phoneNumber: decodedUserToken.client_phone_number,
          email: decodedUserToken.client_email,
          businessName: decodedUserToken.client_business_name,
          businessBio: bioLanguageKw.business_bio,
          businessAddress: decodedUserToken.client_business_address,
          operatingHours: decodedUserToken.client_operating_hours,
          languageStyle: bioLanguageKw.language_style,
          keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
          serviceArea: decodedUserToken.client_service_area,
        };
      
      console.log(businessDetails)


      const response = await createBusinessEntry(businessDetails, payloadToken)

      // generate

      res.redirect('/')
      // await uploadInstagramPost(instagramAuthData.access_token, userId, tenantId, businessDetails, payloadToken)
      
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

export async function uploadInstagramPost(instagramToken: string, userId: string, tenantId: string, businessDetails: any, payloadToken) {
  const posts = await getInstagramPosts(instagramToken);

  for (const post of posts) {
    if (post.media_type === 'IMAGE') {
      
      const image = await downloadImageToMemory(post.media_url);

      const imageUploadResponse = await uploadImageToCollection(image, instagramHandle, payloadToken)
      const mediaId = imageUploadResponse.doc.id;

      const postTitle = 'Hardcoded Title'
      const postExcerpt = 'Hardcoded Excerpt'
      const postSlug = 'hardcoded-slug'

      const postEntryData = {
      title: postTitle || 'Default Title',
      excerpt: postExcerpt,
      slug: postSlug,
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

    const response = await sendPostEntryDataToCollection(postEntryData, payloadToken, instagramHandle)

    break; // Stop iterating over the array
    }
  }


}


