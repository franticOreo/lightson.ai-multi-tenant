import json from "json5";

export async function understandImage(imageUrl: string, aiClient: any, prompt: string = "What's in this image?"): Promise<string> {
    console.log('GPT is analysing image...')
    const response = await aiClient.chat.completions.create({
      model: "gpt-4-vision-preview",
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
      // stream: true,
      max_tokens: 300,
    });
  
    return response.choices[0].message.content//OpenAIStream(response);
  };

export async function profileToBioLanguageKw(bioLanguageKwPrompt: string, aiClient: any): Promise<any> {
    const maxRetries = 3;
    let retryCount = 0;
  
    let profileBioLanguageKw: { business_bio?: string; language_style?: string; SEO_keywords?: string; } = {};
  
    while (retryCount < maxRetries) {
      const response = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a helpful assistant designed to output JSON." },
          { role: "user", content: bioLanguageKwPrompt }
        ]
      });
  
      profileBioLanguageKw = JSON.parse(response.choices[0].message.content);
  
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



export async function createPostFields(blogPrompt: string, aiClient: any): Promise<any> {
  let maxRetries = 3;
  let retryCount = 0;
  let blogFields;

  while (retryCount < maxRetries) {
    const response = await aiClient.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
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

    blogFields = JSON.parse(response.choices[0].message.content);

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


