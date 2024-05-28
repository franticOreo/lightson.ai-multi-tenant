import { createBioLanguageKwPrompt, profileToBioLanguageKw} from "./gpt";
import axios from 'axios';
import { fetchInstagramUserHeader } from './instagramBio';
import { pickColors } from './gpt';

export const runtime = "edge";

require('dotenv').config();



export async function createBusinessEntry(businessDetails: any, payloadToken: string) {
    const response = await axios({
        method: 'POST',
        url: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/business`, // Adjust this URL to your post creation endpoint
        data: businessDetails,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payloadToken}`,
        },
      })
      .catch(error => {
        if (error.response) {
          console.error('Error creating business entry:', error.response.data);
          console.error('HTTP Status Code:', error.response.status);
        } else {
          console.error('Error creating business entry:', error.message);
        }
      });
      
    return response;

    }

export async function generateRemainingBusinessDetails(payloadToken: string, instagramHandle: string, clientServiceArea: string) {
    const userHeader = await fetchInstagramUserHeader(instagramHandle)
    
    const colors = await pickColors(userHeader.profilePicUrlHD) || {}; // Ensure colors is an object

    const businessBio = userHeader.biography

    const bioLanguageKwPrompt = createBioLanguageKwPrompt(businessBio, clientServiceArea)
    const bioLanguageKw = await profileToBioLanguageKw(bioLanguageKwPrompt) || {}; // Ensure bioLanguageKw is an object

    // combine bioLanguageKw and colors
    const remainingDetails = {
        ...bioLanguageKw,
        ...colors
    }

    return remainingDetails

}





