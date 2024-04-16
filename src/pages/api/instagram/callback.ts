import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { takeUserProfileScreenshot, getInstagramPosts } from '../../../utils/instagramFunctions';

async function getUserProfile(accessToken: string) {
    try {
        const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        const data = await response.json();
        console.log('Response from Instagram API:', data);
        return data.username;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code not provided or is invalid' });
  }

  try {
    const clientId = '743103918004392';
    const clientSecret = '2647020baecf2da6ba40f57d151d730b';
    // const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
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
        redirect_uri: 'https://3b36-122-202-8-240.ngrok-free.app/api/instagram/callback',
        code,
      }),
    });

    const data = await response.json();

    console.log(data)

    if (data.access_token) {

      const instagramHandle = await getUserProfile(data.access_token)

      takeUserProfileScreenshot(`https://www.instagram.com/${instagramHandle}`, instagramHandle)

      const posts = getInstagramPosts(data.access_token)

              

      res.redirect(307, '/success-page');
    } else {
      // Handle errors, e.g., display an error message to the user.
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}