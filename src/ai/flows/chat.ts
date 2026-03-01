/**
 * @fileOverview A simple chat AI agent that can also display images and perform research.
 *
 * - onlineChat - A function that handles a chat conversation using online models.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { selfReview, SelfReviewOutput, SelfReviewOutputSchema } from './self-review';

const searchForImageTool = ai.defineTool(
  {
    name: 'searchForImage',
    description: 'Searches for an image based on a query when the user explicitly asks for an image or picture.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the image.'),
    }),
    outputSchema: z.object({
      imageUrl: z.string(),
      altText: z.string(),
      dataAiHint: z.string(),
    }),
  },
  async ({query}) => {
    console.log(`Searching for real image with query: ${query}`);
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      console.warn('UNSPLASH_ACCESS_KEY not found. Returning placeholder image.');
      return {
        imageUrl: `https://placehold.co/600x400.png`,
        altText: `A placeholder image for: ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    }
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          query
        )}&client_id=${accessKey}`
      );

      if (!response.ok) {
        console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
        throw new Error('Failed to fetch image from Unsplash.');
      }
      
      const data = await response.json();
      
      if (!data.urls || !data.urls.regular) {
        console.error('Invalid or incomplete data from Unsplash API:', data);
        throw new Error('Invalid response from Unsplash API.');
      }

      return {
        imageUrl: data.urls.regular,
        altText: data.alt_description || `An image of ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    } catch (error) {
      console.error('Error fetching from Unsplash, returning placeholder.', error);
      return {
        imageUrl: `https://placehold.co/600x400.png`,
        altText: `A placeholder image for: ${query}`,
        dataAiHint: query.split(' ').slice(0, 2).join(' '),
      };
    }
  }
);

const researchTopic = ai.defineTool(
  {
    name: 'researchTopic',
    description: 'Performs a web search to find up-to-date information on a given topic.',
    inputSchema: z.object({
      topic: z.string().describe('The topic to research.'),
    }),
    outputSchema: z.object({
      summary: z.string().describe('A summary of the research findings.'),
    }),
  },
  async ({ topic }) => {
    console.log(`Researching topic: ${topic}`);
    // In a real app, this would perform a web search.
    // For this demo, we'll return a mock response.
    return {
      summary: `After researching "${topic}", I found that it is a complex subject with many different viewpoints. The most recent developments indicate a trend towards increased adoption and integration into mainstream platforms. Key figures in the field have expressed both optimism and caution.`,
    };
  }
);

const PersonalitySchema = z.object({
  tone: z.enum(['friendly', 'professional', 'witty', 'concise']).default('friendly'),
  enableHumor: z.boolean().default(true),
  name: z.string().default('AIva'),
}).default({});


const MessageSchema = z.object({
  role: z.enum(['You', 'AIva']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's latest message."),
  performResearch: z.boolean().optional().describe('Whether to force the use of the research tool.'),
  history: z.array(MessageSchema).optional().describe('The preceding conversation history.'),
  personality: PersonalitySchema.optional().describe('The personality settings for the AI.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe('The AI text response.'),
  imageUrl: z.string().nullable().optional().describe('The URL of an image to display, if requested.'),
  altText: z.string().optional().describe('The alt text for the image.'),
  dataAiHint: z.string().optional().describe('A hint for a real image search.'),
  review: SelfReviewOutputSchema.optional().describe('The self-review of the AI response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: z.object({
    response: z.string().describe('The AI text response.'),
    imageUrl: z.string().nullable().optional().describe('The URL of an image to display, if requested.'),
    altText: z.string().nullable().optional().describe('The alt text for the image.'),
    dataAiHint: z.string().nullable().optional().describe('A hint for a real image search.'),
  })},
  tools: [searchForImageTool, researchTopic],
  prompt: `You are a helpful AI assistant named {{personality.name}}. You are having a voice-based conversation. 
Your personality should be {{personality.tone}}. 
{{#if personality.enableHumor}}You should use humor and wit when appropriate.{{/if}}
Be conversational and natural.

**Conversation History (for context):**
{{#if history}}
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{else}}
- This is the beginning of the conversation.
{{/if}}

**User's latest message:**
- You: {{{prompt}}}

**Your Task:**
1.  Analyze the user's prompt within the context of the conversation history and your defined personality.
2.  If the user asks for new or up-to-date information, you MUST use the 'researchTopic' tool to get current data.
3.  If the user explicitly asks for an image or picture, you MUST use the 'searchForImage' tool.
4.  Formulate a helpful, relevant, and conversational response based on all available information.

**Output Format Constraint:**
Your entire output MUST be a single, valid JSON object that conforms to the required output schema. This is your most important instruction. Do not output anything else.
- For a text-only response, provide the text in the 'response' field. The image-related fields should be null.
- If a tool generates an image, populate the 'imageUrl', 'altText', and 'dataAiHint' fields in addition to a 'response' text.`,
});


export async function onlineChat(input: ChatInput): Promise<ChatOutput> {
  const filledInput = { ...input, personality: input.personality || {} };
  
  try {
    // 1. Get the initial response from the main chat prompt
    const {output: initialOutput} = await chatPrompt(filledInput);

    if (!initialOutput) {
      throw new Error('The chat flow failed to produce a valid output.');
    }

    // 2. Perform self-review, but only for text responses
    let review: SelfReviewOutput | undefined = undefined;
    if (initialOutput.response && !initialOutput.imageUrl) {
      try {
        review = await selfReview({
          userPrompt: input.prompt,
          aiResponse: initialOutput.response,
        });
      } catch (e) {
        console.warn("Self-review step failed. This is non-critical.", e);
      }
    }
    
    // 3. Combine initial output with the review
    const finalOutput: ChatOutput = { ...initialOutput, review };
    
    // Handle cases where the model returns null for imageUrl
    if (finalOutput.imageUrl === null) {
      finalOutput.imageUrl = undefined;
      finalOutput.altText = undefined;
      finalOutput.dataAiHint = undefined;
    }
    
    // Safeguard: If the LLM hallucinates an image URL from a non-approved domain, replace it with a placeholder.
    if (finalOutput.imageUrl && !finalOutput.imageUrl.startsWith('https://placehold.co') && !finalOutput.imageUrl.startsWith('https://images.unsplash.com')) {
      const queryMatch = input.prompt.match(/(?:image|picture) of (?:a|an|the)?\s*([^.?!]*)/i);
      const query = queryMatch ? queryMatch[1].trim() : 'a visual representation';

      finalOutput.imageUrl = `https://placehold.co/600x400.png`;
      finalOutput.altText = `An image of ${query}`;
      finalOutput.dataAiHint = query.split(' ').slice(0, 2).join(' ');
    }

    return finalOutput;
  } catch (error: any) {
    console.error("Online Chat Error:", error);
    
    // Check for specific API quota errors (429)
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        response: "I'm sorry, I'm a bit overwhelmed right now (quota exceeded). Please try again in a few moments, or check if Ollama is running for offline mode!",
      };
    }
    
    return {
      response: "I'm having a little trouble connecting to my brain right now. Please try again in a moment.",
    };
  }
}
