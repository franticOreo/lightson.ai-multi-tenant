import axios from 'axios';
import { downloadImageToMemory, uploadImageToCollection, loginUser } from './instagramFunctions';
import { makePostPrompt, createPostFields, understandImage } from './gpt';

async function sendPostEntryDataToCollection(postEntryData: any, accessToken: string, client_instagram_handle: string) {
    // we 
    const protocol = process.env.APP_ENV === 'production' ? 'https' : 'http';
    try {
      const response = await axios({
        method: 'post',
        url: `${protocol}://${client_instagram_handle}.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}/api/posts`, // Adjust this URL to your post creation endpoint
        data: postEntryData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Ensure accessToken is passed correctly
        },
      });
  
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create post:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  
  export async function createPostEntry(instagramHandle: string, userId: string, tenantId: string, payloadToken: string,
    post: any, postFields: any,) {
    
    const postUrl = post.media_url
    const image = await downloadImageToMemory(postUrl);
    const imageUploadResponse = await uploadImageToCollection(image, instagramHandle, payloadToken)
    const mediaId = imageUploadResponse.doc.id;

    const postEntryData = {
    title: postFields.title,
    excerpt: postFields.excerpt,
    slug: postFields.slug,
    date: new Date().toISOString(),
    coverImage: mediaId,
    author: userId,
    tenant: tenantId,
    richText: [
        {
        children: [{ text: instagramHandle }],
        type: 'h1'
        },
        {
        children: [{ text: postFields.content }]
        }
    ],
    };

    return postEntryData
  
  }

  export async function postsCreationPipeline({
    posts,
    clientBusinessBio,
    clientLanguageStyle,
    clientServiceArea,
    clientKeywords,
    instagramHandle,
    userId,
    tenantId,
    payloadToken
  }: {
    posts: any,
    clientBusinessBio: string,
    clientLanguageStyle: string,
    clientServiceArea: string,
    clientKeywords: string,
    instagramHandle: string,
    userId: string,
    tenantId: string,
    payloadToken: string
  }) {
    const bioLanguageKwObj = {
        clientBusinessBio,
        clientLanguageStyle,
        clientServiceArea,
        clientKeywords
    };

    const postUnderstandings = [];
    const postEntriesData = await Promise.all(posts.map(async (post) => {
        try {
            const postCaption = post.caption;
            const imageUrl = post.media_url;
            console.log(imageUrl);
            const postUnderstanding = await understandImage(imageUrl);
            postUnderstandings.push(postUnderstanding);

            const blogPrompt = await makePostPrompt(postCaption, postUnderstanding, bioLanguageKwObj, clientServiceArea);
            const postFields = await createPostFields(blogPrompt);

            const postEntryData = await createPostEntry(instagramHandle, userId, tenantId, payloadToken, post, postFields);
            return postEntryData;
        } catch (error) {
            console.error('Error processing post:', error);
            return null; // Or handle the error as appropriate
        }
    }));

    const responses = await Promise.all(postEntriesData.filter(postEntry => postEntry !== null).map(async (postEntryData) => {
        return sendPostEntryDataToCollection(postEntryData, payloadToken, instagramHandle);
    }));

    return {
        postUnderstandings,
        postEntriesData,
        responses
    };
}

