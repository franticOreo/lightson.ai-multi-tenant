import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Common function to fetch data from the API
export async function fetchInstagramData(username: string) {
  const apiKey = process.env.HIKER_API_KEY;
  const url = `https://api.hikerapi.com/a2/user?username=${username}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
        'x-access-key': apiKey
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Function to get specific user header data
export async function fetchInstagramUserHeader(username: string) {
  const data = await fetchInstagramData(username);
  if (data) {
    const userData = data.graphql.user;
    return {
      businessName: userData.full_name,
      profilePicUrlHD: userData.profile_pic_url_hd,
      biography: userData.biography
    };
  }
  return null;
}