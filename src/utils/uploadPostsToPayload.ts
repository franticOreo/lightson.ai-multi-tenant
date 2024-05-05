import { Request, Response } from 'express';
import {getInstagramPosts, getPayloadAuthToken, getInstagramHandle, createInstagramProfileEntry} from './instagramFunctions'; 
import jwt from 'jsonwebtoken';
import { generateRemainingBusinessDetails, createBusinessEntry } from './createBusinessDetails';
import { postsCreationPipeline } from './postCreation';
import { createTenant, assignTenantToUser } from './tenantUserManagement';
import payload from 'payload';

export function extractUserTokenFromState(state: string | undefined): string | null {
  if (!state) return null;

  try {
    const decodedState = decodeURIComponent(state);
    const parsedState = JSON.parse(decodedState);
    return parsedState.userId
  } catch (error) {
    console.error('Error extracting userToken from state:', error);
    return null;
  }
}

export async function handleInstagramCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  console.log(req.query)
  

  const payloadUserId = extractUserTokenFromState(state as string | undefined);


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

    interface InstagramAuthResponse {
      access_token: string;
    }
    // Get the access token from Instagram
    const { access_token: instagramAccessToken } = await response.json() as InstagramAuthResponse;

    // get the instagram handle and user id using access token
    const { id: instagramUserId, username: instagramHandle } = await getInstagramHandle(instagramAccessToken);

    const entryResponse = await createInstagramProfileEntry({
      payloadUserId: payloadUserId,
      instagramUserId: instagramUserId,
      instagramHandle: instagramHandle,
      accessToken: instagramAccessToken,
    })

    // Return the instagramHandle to the client
    return res.status(200).json({ instagramHandle });
  } catch (error) {
    console.error('Error during Instagram authentication:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}




//     let createdTenant;
//     let createdUser;

//     try {
//       createdTenant = await createTenant(instagramHandle);
//       createdUser = await assignTenantToUser(userId, createdTenant.id);
//     } catch (error) {
//       return res.status(500).json({ error: 'Error creating User or Tenant' });
//     }


//     // Create Business Details
//     if (instagramAuthData.access_token) {
//       const payloadToken = await getPayloadAuthToken()

//       const bioLanguageKw = await generateRemainingBusinessDetails(payloadToken, instagramHandle, decodedUserToken.clientServiceArea)

//       const keywords = bioLanguageKw.SEO_keywords;

//       const businessDetails = {
//           clientName: decodedUserToken.client_name,
//           instagramHandle: instagramHandle,
//           phoneNumber: decodedUserToken.client_phone_number,
//           email: decodedUserToken.client_email,
//           businessName: decodedUserToken.client_business_name,
//           businessBio: bioLanguageKw.business_bio,
//           businessAddress: decodedUserToken.client_business_address,
//           operatingHours: decodedUserToken.client_operating_hours,
//           languageStyle: bioLanguageKw.language_style,
//           keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
//           serviceArea: decodedUserToken.client_service_area,
//         };
      
//       console.log(businessDetails)


//       const response = await createBusinessEntry(businessDetails, payloadToken)

//       const posts = await getInstagramPosts(instagramAuthData.access_token)
//       const lastFourPosts = posts.slice(-4); 

//       const postsResponse = postsCreationPipeline({
//                                               posts: lastFourPosts,
//                                               instagramToken: instagramAuthData.access_token,
//                                               clientBusinessBio: businessDetails.businessBio,
//                                               clientLanguageStyle: businessDetails.languageStyle,
//                                               clientServiceArea: businessDetails.serviceArea,
//                                               clientKeywords: keywords,
//                                               instagramHandle: businessDetails.instagramHandle,
//                                               userId: createdUser.id,
//                                               tenantId: createdTenant.id,
//                                                     });
      

//       res.redirect('/')
      
      
//     } else {
//       return res.status(400).json({ error: 'Failed to obtain access token' });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }




