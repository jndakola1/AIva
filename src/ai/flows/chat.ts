/**
 * @fileOverview A multi-modal chat AI agent that can display images, perform research, and analyze uploaded photos.
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
    return {
      summary: `Research findings for "${topic}": This topic is currently trending. Recent developments suggest a significant shift in public interest towards more integrated and efficient solutions. Experts highlight the importance of security and scalability in this domain.`,
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
  attachmentUrl: z.string().optional().describe('An optional image attachment as a data URI.'),
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
  prompt: `You are a helpful AI assistant named {{personality.name}}.
Your personality is {{personality.tone}}. 
{{#if personality.enableHumor}}You should use humor and wit when appropriate.{{/if}}
Be conversational and natural.

**Context:**
{{#if history}}
**Conversation History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

{{#if attachmentUrl}}
**Attachment:**
An image has been attached to this message: {{media url=attachmentUrl}}
Please analyze or refer to this image in your response if relevant.
{{/if}}

**User's Message:**
- You: {{{prompt}}}

**Your Task:**
1. Analyze the user's prompt and any attached image.
2. If the user asks for new or up-to-date information, use the 'researchTopic' tool.
3. If the user explicitly asks for an image or picture, use the 'searchForImage' tool.
4. Formulate a helpful, relevant, and conversational response.

**Output Format:**
Your output must be a valid JSON object matching the output schema.`,
});


export async function onlineChat(input: ChatInput): Promise<ChatOutput> {
  const filledInput = { ...input, personality: input.personality || {} };
  
  try {
    const {output: initialOutput} = await chatPrompt(filledInput);

    if (!initialOutput) {
      throw new Error('The chat flow failed to produce a valid output.');
    }

    let review: SelfReviewOutput | undefined = undefined;
    if (initialOutput.response && !initialOutput.imageUrl && !input.attachmentUrl) {
      try {
        review = await selfReview({
          userPrompt: input.prompt,
          aiResponse: initialOutput.response,
        });
      } catch (e) {
        console.warn("Self-review step failed.", e);
      }
    }
    
    const finalOutput: ChatOutput = { ...initialOutput, review };
    
    if (finalOutput.imageUrl === null) {
      finalOutput.imageUrl = undefined;
      finalOutput.altText = undefined;
      finalOutput.dataAiHint = undefined;
    }
    
    // Domain validation for image URLs
    if (finalOutput.imageUrl && !finalOutput.imageUrl.startsWith('https://placehold.co') && !finalOutput.imageUrl.startsWith('https://images.unsplash.com')) {
      finalOutput.imageUrl = `https://placehold.co/600x400.png`;
      finalOutput.altText = `Visual representation`;
      finalOutput.dataAiHint = 'abstract visual';
    }

    return finalOutput;
  } catch (error: any) {
    console.error("Online Chat Error:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        response: "I'm a bit overwhelmed right now (quota exceeded). Please try again in a few moments.",
      };
    }
    return {
      response: "I'm having a little trouble connecting to my brain right now. Please try again in a moment.",
    };
  }
}