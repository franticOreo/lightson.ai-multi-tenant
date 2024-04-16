import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code not provided or is invalid' });
  }

  try {
    const clientId = '743103918004392';
    const clientSecret = 'eli';
    const redirectUri = 'https://localhost:3000/api/instagram/callback';
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

    if (data.access_token) {
      // Here you can handle the access token. For example, save it to your database.
      // Redirect the user to a new page or show a success message.
      // Note: Adjust the redirection URL as needed.
      res.redirect(307, '/success-page');
    } else {
      // Handle errors, e.g., display an error message to the user.
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}