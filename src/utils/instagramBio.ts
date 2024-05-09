import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export async function fetchInstagramUserHeader(username: string) {
  const apiKey = process.env.HIKER_API_KEY;
  const url = `https://api.hikerapi.com/a2/user?username=${username}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'x-access-key': apiKey
      }
    });

    const userData = response.data.graphql.user;
    return {
      businessName: userData.full_name,
      profilePicUrlHD: userData.profile_pic_url_hd,
      biography: userData.biography
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Example usage:
fetchInstagramUserHeader('ayresconstruction').then(userProfile => {
  console.log(userProfile);
});