import axios from 'axios';
import { getInstagramPosts, downloadImageToMemory, uploadImageToCollection, getPayloadAuthToken } from './instagramFunctions';
import { makePostPrompt, createPostFields, understandImage } from './gpt';
import OpenAI from "openai";

require('dotenv').config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function sendPostEntryDataToCollection(postEntryData: any, accessToken: string, client_instagram_handle: string) {
    try {
      const response = await axios({
        method: 'post',
        url: `http://${client_instagram_handle}.${process.env.PAYLOAD_PUBLIC_SERVER_BASE}/api/posts`, // Adjust this URL to your post creation endpoint
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
  
  export async function createPostEntry(instagramToken: string, instagramHandle: string, userId: string, tenantId: string, payloadToken: string,
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
        children: [{ text: 'Ayres Construction Services H1' }],
        type: 'h1'
        },
        {
        children: [{ text: postFields.content }]
        }
    ],
    };

    return postEntryData
  
  }

export async function blogCreationPipeline() { //instagramToken, bioLanguageKw, clientServiceArea
    const clientBusinessBio = 'AyresCon is an Adelaide-based construction company specializing in various construction services such as first fix, second fix, formwork, decks, and renovations. Contact us via email for your construction needs.'
    const clientLanguageStyle = 'Professional and industry-specific, focusing on construction terminology and services.'
    const clientServiceArea = 'Seaford, South Australia, Australia'
    const clientKeywords = 'Adelaide construction company, construction services in Adelaide, first fix, second fix'
    const instagramToken = 'IGQWRPOWxEdE5mRU9TSDhFa3k1bGlLaTZA0bnpjeFhnODlHLTFOLXFyWkpLVlI2T3N3RkJEZAndtWEVmQUdjX05kM0NCcmNGd1lsVDIyamkwVThqYjBoMi12clhWZAjBrMWZA5R3B0WGZALc3VubWNjcDJEUzR6aklqejBvWWN6ajVDSTc0ZAwZDZD'
    const posts = await getInstagramPosts(instagramToken);

    const instagramHandle = 'ayresconstruction'
    const userId = '662578544a1558a084527ae4'
    const tenantId = '662578544a1558a084527ae0'
    const payloadToken = await getPayloadAuthToken()


    const postCaption = posts[0].caption;
    const imageUrl = posts[0].media_url;
    console.log(imageUrl)
    const postUnderstanding = await understandImage(imageUrl, openai)

    const bioLanguageKwObj = {
        clientBusinessBio: clientBusinessBio,
        clientLanguageStyle: clientLanguageStyle,
        clientServiceArea: clientServiceArea,
        clientKeywords: clientKeywords
    }

    const blogPrompt = await makePostPrompt(postCaption, postUnderstanding, bioLanguageKwObj, clientServiceArea)
    // console.log(blogPrompt)
    const postFields = await createPostFields(blogPrompt, openai)
    
    const postEntryData = await createPostEntry(instagramToken, instagramHandle, userId, tenantId, payloadToken, posts[0], postFields)
    const response = await sendPostEntryDataToCollection(postEntryData, payloadToken, instagramHandle)
    return response
}

blogCreationPipeline()

