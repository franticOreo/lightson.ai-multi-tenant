import { OpenAI } from 'openai';  

import dotenv from 'dotenv';
dotenv.config();

export async function understandImage(imageUrl: string, prompt: string = "What's in this image?", responseFormat: "text" | "json_object" = "text"): Promise<string> {
    console.log('GPT is analysing image...')
    const aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await aiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
                image_url: {
                  url: imageUrl,
                },
            }
          ],
          
        },
      ],
      response_format : { type: responseFormat },
      // stream: true,
      max_tokens: 300,
    });
  
    return response.choices[0].message.content || "No content available";
  };


// test understandImage with url= https://scontent.cdninstagram.com/v/t51.29350-15/446114704_1812680229224962_28830565818587702_n.webp?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE0NDAuc2RyLmYyOTM1MCJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=110&_nc_ohc=oNeJvuZONlsQ7kNvgEfBUeV&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzM3NjE0MDI4MTAzMTkzNzA2Nw%3D%3D.2-ccb7-5&oh=00_AYDBJqbru-hSzmZ4gw_Q6MxW9ivPsMTRw4gJxs-Va5v3ZA&oe=6659955C&_nc_sid=10d13b
export async function pickColors(imageUrl: string) {
  const prompt = "Respond in JSON. I have supplied a company logo. I need two HEX color codes that will complement this logo. The first color should be a primary color and the second should be a complementary secondary color. Please suggest colors that harmonize well with these design elements. The output should be in the following format: PRIMARY_COLOR=#XXXXXX SECONDARY_COLOR=#XXXXXX"
  let response = await understandImage(imageUrl, prompt, "json_object")
  while (!response.includes("PRIMARY_COLOR") || !response.includes("SECONDARY_COLOR")) {
    response = await understandImage(imageUrl, prompt, "json_object")
  }
  return JSON.parse(response);
}

export async function profileToBioLanguageKw(bioLanguageKwPrompt: string): Promise<any> {
    const aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const maxRetries = 3;
    let retryCount = 0;
  
    let profileBioLanguageKw: { business_bio?: string; language_style?: string; SEO_keywords?: string; } = {};
  
    while (retryCount < maxRetries) {
      const response = await aiClient.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a helpful assistant designed to output JSON." },
          { role: "user", content: bioLanguageKwPrompt }
        ]
      });
  
      profileBioLanguageKw = JSON.parse(response.choices[0].message.content || '{}');
  
      if ('business_bio' in profileBioLanguageKw && 'language_style' in profileBioLanguageKw && 'SEO_keywords' in profileBioLanguageKw) {
        break; // Exit the loop if all required keys are present
      }
  
      retryCount += 1;
  
      if (retryCount === maxRetries) {
        console.log("Failed to obtain all required keys after 3 retries.");
      } else {
        console.log("Blog object contains all required keys.");
      }
    }
  
    return profileBioLanguageKw
  }


export function createBioLanguageKwPrompt(businessBio: string, clientServiceArea: string): string {
    return `Read this page description: ${businessBio} 
  and create three fields: 
  - \`business_bio\` : 2-3 sentences. 
  - \`language_style\`: to suit the business and its content
  - \`SEO_keywords\`: using local area ${clientServiceArea}`;
  }

export function makePostPrompt(postCaption: string, imageUnderstanding: string, bioLanguageKwObj: any, clientServiceArea: string): string {
    const clientBusinessBio: string = bioLanguageKwObj.clientBusinessBio;
    const clientLanguageStyle: string = bioLanguageKwObj.clientLanguageStyle;
    const clientKeywords: string = bioLanguageKwObj.clientKeywords;

    return `Business Bio: ${clientBusinessBio}
  
      Language: ${clientLanguageStyle}
  
      Caption: ${postCaption}
  
      Image Post Description: ${imageUnderstanding}
  
      Location: ${clientServiceArea}
  
      Target Keyword: ${clientKeywords}
  
      Using the information from the Instagram post above, create a short blog post that incorporates the caption, image description, and location to optimize it for local SEO. The blog post should be informative, engaging, and relevant to the target keyword while naturally incorporating it throughout the content.
  
      Return the following four elements:
  
      \`title\`: A catchy headline that includes the target keyword 
  
      \`content\`: An introduction that grabs the reader's attention and sets the context
      Body paragraphs that expand on the topic, providing valuable information and naturally integrating the target keyword, location, and relevant details from the Instagram post
      A conclusion that summarizes the main points and includes a call-to-action
  
      \`excerpt\`: A concise summary of the blog post (up to 160 characters) that includes the target keyword and entices users to click through from search engine results
      Ensure the blog post is well-written, informative, and optimized for both readability and search engines. Use short paragraphs, subheadings, and bullet points where appropriate to enhance readability.
  
      \`slug\`: A slug for the post.
      `;
  }



export async function createPostFields(blogPrompt: string): Promise<any> {
  const aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let maxRetries = 3;
  let retryCount = 0;
  let blogFields: { title?: string; content?: string; excerpt?: string; slug?: string; } = {};

  while (retryCount < maxRetries) {
    const response = await aiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant designed to output JSON."
        },
        {
          role: "user",
          content: blogPrompt
        },
      ],
      response_format: {"type": "json_object"},
      max_tokens: 1024,
      temperature: 0.9,
    });

  
    console.log(response.choices[0].message.content)

    blogFields = JSON.parse(response.choices[0].message.content || '{}');

    if (['title', 'content', 'excerpt', 'slug'].every(key => key in blogFields)) {
      break; // Exit the loop if all required keys are present
    }

    retryCount += 1;
  }

  if (retryCount === maxRetries) {
    console.log("Failed to obtain all required keys after 3 retries.");
  } else {
    console.log("Blog object contains all required keys.");
  }

  return blogFields;
}  


function makeAboutPagePrompt(businessDetails, postUnderstandings) {
  return `Generate an About Page "aboutPage" and Services list "serviceList" for a business website using the following details:

  Business Name: ${businessDetails.businessName}
  Business Bio (from Instagram): ${businessDetails.businessBio}
  SEO Keywords: ${businessDetails.keywords}
  
  The following image descriptions of the user's recent Instagram posts may be useful:
  
  1. Image 1 description: ${postUnderstandings[0]}
  2. Image 2 description: ${postUnderstandings[1]}
  3. Image 3 description: ${postUnderstandings[2]}
  4. Image 4 description: ${postUnderstandings[3]}
  
  The tone should align with the following language style: ${businessDetails.languageStyle}.
  Ensure that the page is optimized for SEO, using the keywords provided in a natural way.
  
  Output the data in the following JSON structure:
  
  {
    "aboutPage": "Generated content here",
    "serviceList": [
      "Service 1",
      "Service 2",
      ...
    ]
  }`
}

export async function generateAboutPage(businessDetails, postUnderstandings) {
  const prompt = makeAboutPagePrompt(businessDetails, postUnderstandings);
  
  const aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let maxRetries = 3;
  let retryCount = 0;
  let aboutPageFields: {
    aboutPage: string; 
    serviceList: { service: string }[];
  } = {
    aboutPage: "",
    serviceList: [] 
  };

  console.log('Creating about page...')
  while (retryCount < maxRetries) {
    const response = await aiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant designed to output JSON."
        },
        {
          role: "user",
          content: prompt
        },
      ],
      response_format: {"type": "json_object"},
      max_tokens: 1024,
      temperature: 0.9,
    });

    aboutPageFields = JSON.parse(response.choices[0].message.content || '{}');

    if (['aboutPage', 'serviceList'].every(key => key in aboutPageFields)) {
      break; // Exit the loop if all required keys are present
    }

    retryCount += 1;
  }

  // Transform serviceList from strings to objects
  const transformedServiceList = aboutPageFields.serviceList.map(service => ({ service }));
  
  console.log(transformedServiceList)

  console.log('About page created.')
  return {
    ...aboutPageFields,
    serviceList: transformedServiceList // Return the transformed list
  };
}


