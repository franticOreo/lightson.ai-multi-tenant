import { getUserProfile, takeUserProfileScreenshot, downloadImageToMemory, uploadImageToCollection } from './instagramFunctions'; 
import OpenAI from "openai";
import { understandImage, createBioLanguageKwPrompt, profileToBioLanguageKw} from "./gpt";
import { getPayloadAuthToken } from './instagramFunctions';
import payload from "payload";
import axios from 'axios';

export const runtime = "edge";

require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function createBusinessEntry(businessDetails: any, payloadToken) {
    console.log(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/business`)
    console.log('-----------------------')
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

    }

// async function testCreateBusinessDetails() {
//     const payloadToken = await getPayloadAuthToken()
//     // const payloadToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MWRiZWM4ZmJhMjFhZmY2NTgyOTdiOSIsImNvbGxlY3Rpb24iOiJ1c2VycyIsImVtYWlsIjoiZGVtb0BwYXlsb2FkY21zLmNvbSIsImlhdCI6MTcxMzU4MjA4NCwiZXhwIjoxNzEzNTg5Mjg0fQ.j7vg6VtTMPeutatd63DZTnTl98gJSn9iyaOPtBxv6yQ'

//     const bioLanguageKw = await generateRemainingBusinessDetails(payloadToken);

//     console.log(typeof bioLanguageKw)
//     console.log(bioLanguageKw.SEO_keywords)
//     console.log(typeof bioLanguageKw.SEO_keywords)

//     const clientName = "Example Client";
//     const instagramHandle = "@examplebusiness";
//     const phoneNumber = "123-456-7890";
//     const email = "contact@examplebusiness.com";
//     const businessName = "Example Business";
//     const businessBio = "This is a short bio of the Example Business.";
//     const businessAddress = "123 Example St, Example City, EX 12345";
//     const operatingHours = "9AM - 5PM";
//     // const keywords = [{ keyword: "Example" }, { keyword: "Business" }];
//     const serviceArea = "Example City and surrounding areas";

//     const keywords = bioLanguageKw.SEO_keywords;

//     const businessDetails = {
//         clientName: clientName,
//         instagramHandle: instagramHandle,
//         phoneNumber: phoneNumber,
//         email: email,
//         businessName: businessName,
//         businessBio: bioLanguageKw.business_bio,
//         businessAddress: businessAddress,
//         operatingHours: operatingHours,
//         languageStyle: bioLanguageKw.language_style,
//         keywords: Array.isArray(keywords) ? keywords.map(keyword => ({ keyword })) : typeof keywords === 'string' ? keywords.split(', ').map(keyword => ({ keyword })) : [],
//         serviceArea: serviceArea,
//       };

//     console.log(businessDetails)

//     const response = await createBusinessEntry(businessDetails, payloadToken)

// }

export async function generateRemainingBusinessDetails(payloadToken: string, instagramHandle: string, clientServiceArea: string) {
    const screenshotBuffer = await takeUserProfileScreenshot(`https://www.instagram.com/${instagramHandle}`, instagramHandle);
    
    const encoded = screenshotBuffer.toString("base64");
    const imageUrl = `data:image/png;base64,${encoded}`
    // SHOULD MAKE THIS STREAMING RESPONSE FOR FRONT END
    
    const profileUnderstanding = await understandImage(imageUrl, openai);
    // console.log(profileUnderstanding)

//     const profileUnderstanding = `The image appears to be a screenshot of an Instagram profile for a business named Ayres Construction (AyresCon as per their logo), likely a company specializing in construction services as indicated by their description. The description mentions they are an Adelaide based construction company and they offer services such as first fix, second fix, formwork, decks, and renovations.

// There are several posts shown that seem to display the company's work on different construction projects. The posts illustrate various stages of construction and renovation:

// 1. Top left: A room in an early stage of renovation or construction with the floorboards exposed.
// 2. Top right: The exterior of a building with a doorway supported by temporary framing, possibly in the midst of a renovation or construction project.
// 3. Bottom left: A finished interior with a wall featuring both painted surfaces and decorative stone tiles, along with new flooring.
// 4. Bottom middle: A stand-alone wall or partition with wainscoting detail, located in a room that looks to be newly renovated or constructed.
// 5. Bottom right: Blue tarps covering items, likely furniture, during a renovation or construction process to protect them from dust or damage.

// The image shows off the company's range of work from the initial stages to the finished product. Each photo highlights different aspects and types of work related to building and renovations that the company presumably offers.`


    // const clientServiceArea = 'Seaford, SA, Australia'

    const bioLanguageKwPrompt = createBioLanguageKwPrompt(profileUnderstanding, clientServiceArea)
    const bioLanguageKw = await profileToBioLanguageKw(bioLanguageKwPrompt, openai)

    return bioLanguageKw

}


// testCreateBusinessDetails();










// export async function createBusinessDetails(instagramToken: string, payloadToken: string) {
//     const instagramHandle = await getUserProfile(instagramToken);
//     const screenshotBuffer = await takeUserProfileScreenshot(`https://www.instagram.com/${instagramHandle}`, instagramHandle);
    
//     const encoded = screenshotBuffer.toString("base64");
//     const imageUrl = `data:image/png;base64,${encoded}`

//     // const decodedImage = Buffer.from(encoded, 'base64');
//     // // Specify the path and filename for the output PNG file
//     // const outputPath = `./output/${instagramHandle}.png`;
//     // // Write the binary data to a PNG file
//     // fs.writeFileSync(outputPath, decodedImage);


    
//     const profileUnderstanding = await understandImage(imageUrl, openai);
//     console.log(profileUnderstanding)
//     // console.log(businessDetails)
//     return screenshotBuffer
// }




