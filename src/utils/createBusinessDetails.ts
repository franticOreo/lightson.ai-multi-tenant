import { createBioLanguageKwPrompt, profileToBioLanguageKw} from "./gpt";
import axios from 'axios';
import { fetchInstagramUserHeader } from './instagramBio';
import { pickColors } from './gpt';
import payload from 'payload';

export const runtime = "edge";

require('dotenv').config();


export async function createBusinessEntry(businessDetails: any) {
    // Set businessName to instagramHandle if not provided
    if (!businessDetails.businessName) {
        businessDetails.businessName = businessDetails.instagramHandle;
    }

  try {
      const response = await payload.create({
          collection: 'business', // Adjust 'business' to your actual collection name
          data: businessDetails,
          context: { isSignupOrOnboarding: true }
      });
      return response;
  } catch (error) {
      console.error('Error creating business entry:', error);
  }
}

export async function generateRemainingBusinessDetails(instagramHandle: string, clientServiceArea?: string) {
    // console.log("generateRemainingBusinessDetails called with:", instagramHandle, clientServiceArea);
    const userHeader = await fetchInstagramUserHeader(instagramHandle)
    
    const colors = await pickColors(userHeader.profilePicUrlHD) || {}; // Ensure colors is an object
    console.log('Colors', colors)

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




