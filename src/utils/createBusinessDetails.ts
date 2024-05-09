import { takeUserProfileScreenshot } from './instagramFunctions'; 
import OpenAI from "openai";
import { understandImage, createBioLanguageKwPrompt, profileToBioLanguageKw} from "./gpt";
import axios from 'axios';
import { fetchInstagramUserHeader } from './instagramBio';

export const runtime = "edge";

console.log('dummy')

require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createBusinessEntry(businessDetails: any, payloadToken: string) {
    const response = await axios({
        method: 'post',
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

    const businessBio = userHeader.biography

    const bioLanguageKwPrompt = createBioLanguageKwPrompt(businessBio, clientServiceArea)
    const bioLanguageKw = await profileToBioLanguageKw(bioLanguageKwPrompt, openai)

    return bioLanguageKw

}





