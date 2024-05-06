import { Request, Response } from 'express';
import { getInstagramHandle, createInstagramProfileEntry} from './instagramFunctions'; 
import uploadInitialPostsToPayload from './uploadPostsToPayload';

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

    console.log('Created instagram profile entry:', entryResponse)

    // Return the instagramHandle to the client
    res.redirect(`/onboarding?userId=${payloadUserId}`);

    try {
      console.log('Beginning post creation pipeline.');
      const response = await uploadInitialPostsToPayload(payloadUserId, 4)
      console.log(response)
    } catch (error) {
      console.error('Error during additional processing:', error);
    }


  } catch (error) {
    console.error('Error during Instagram authentication:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}