import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Common function to fetch data from the API
export async function fetchInstagramData(username: string) {
  const apiKey = "38njcl7axC7jZyTc22qmGb34Nucxk6w2";
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
    console.error('Error fetching instagram profile:', error?.message);
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


// import fs from 'fs';

// // test fetchInstagramData
// async function testFetchInstagramData() {
//   const data = await fetchInstagramData('ayresconstruction');
//   console.log('data', data);

//   // write data to file, output.json
//   fs.writeFileSync('./output.json', JSON.stringify(data, null, 2));
// }

// testFetchInstagramData();

