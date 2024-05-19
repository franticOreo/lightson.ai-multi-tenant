import { fetchInstagramData } from './instagramBio'
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';  

// ## TODO
// Get the image a text summaries of the clients posts with the context of their 
// biography.
// 

// I want to create a prompt for a large language model (LLM). I want the LLM to generate an about page (or introduction page) for a client (either businesses or individuals) website. 

// The LLM has access to the clients instagram such as their biography and historical te

const instagramHandle = "ayresconstruction";

async function storeUserHeader() {
    const filePath = path.join(__dirname, 'userHeader.json');
    try {
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            const userHeader = await fetchInstagramData(instagramHandle);
            fs.writeFileSync(filePath, JSON.stringify(userHeader, null, 2), 'utf8');
            console.log('User header saved to file.');
        } else {
            console.log('User header already exists.');
        }
    } catch (error) {
        console.error('Error fetching or writing user header:', error);
    }
}

interface PostNode {
    node: {
      edge_media_to_caption: {
        edges: Array<{ node: { text: string } }>
      }
    }
  }
  
  interface UserData {
    biography: string;
    edge_owner_to_timeline_media: {
      edges: PostNode[];
    };
  }
  
  function extractBiographyAndPostsText(userData: UserData): { biography: string; postsText: string[] } {
    const biography = userData.biography;
    const postsText = userData.edge_owner_to_timeline_media.edges.map(edge => 
      edge.node.edge_media_to_caption.edges.map(caption => caption.node.text).join(' ')
    );
  
    return { biography, postsText };
  }

  function createPromptForAboutPage(biography: string, postsText: string[]): string {
    const allPostsText = postsText.join(' ');
    const prompt = `Create an about page for a construction company. Here is the biography: ${biography} Here are some highlights from their projects: ${allPostsText}`;
    return prompt;
  }

  async function generateAboutPageText(prompt: string): Promise<string> {
    const aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
    const response = await aiClient.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
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
    
    return response.choices[0].message.content
  }

