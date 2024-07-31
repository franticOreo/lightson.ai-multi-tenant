import { createBioLanguageKwPrompt, profileToBioLanguageKw} from "./gpt";
import axios from 'axios';
import { fetchInstagramUserHeader } from './instagramBio';
import { pickColors } from './gpt';
import payload from 'payload';

export const runtime = "edge";

require('dotenv').config();



export async function createBusinessEntry(businessDetails: any) {
  console.log(businessDetails)
  try {
      const response = await payload.create({
          collection: 'business', // Adjust 'business' to your actual collection name
          data: businessDetails,
      });
      return response;
  } catch (error) {
      console.error('Error creating business entry:', error);
  }
}

export async function generateRemainingBusinessDetails(instagramHandle: string, clientServiceArea: string) {
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





