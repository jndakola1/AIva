'use server';
/**
 * @fileOverview A simple chat AI agent that can also display images and perform research.
 *
 * - chat - A function that handles a chat conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    console.log(`Searching for image with query: ${query}`);
    return {
      imageUrl: `https://placehold.co/600x400.png`,
      altText: `An image of ${query}`,
      dataAiHint: query.split(' ').slice(0, 2).join(' '),
    };
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


const ChatInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
  performResearch: z.boolean().optional().describe('Whether to force the use of the research tool.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI text response.'),
  imageUrl: z.string().optional().describe('The URL of an image to display, if requested.'),
  altText: z.string().optional().describe('The alt text for the image.'),
  dataAiHint: z.string().optional().describe('A hint for a real image search.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [searchForImageTool, researchTopic],
  prompt: `You are a helpful AI assistant named Aiva. Respond to the following prompt concisely.

If the user asks to see an image or a picture of something, use the searchForImage tool. When you use the tool, its output will be provided back to you. Use that information to formulate your final response in the required JSON format, including the imageUrl, altText, and dataAiHint if a tool was used. Also provide a short text response, like "Of course, here is a picture of a cat."

If the 'performResearch' flag is true, you MUST use the researchTopic tool to answer the user's prompt. If the user's prompt seems to ask for recent or up-to-date information, you should also use the researchTopic tool. After getting the research summary, present it to the user in a clear and helpful way.

Otherwise, answer from your existing knowledge.

Prompt: {{{prompt}}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The chat flow failed to produce an output.');
    }
    
    // Safeguard: If the LLM hallucinates an image URL, replace it with a placeholder to prevent crashes.
    if (output.imageUrl && !output.imageUrl.startsWith('https://placehold.co')) {
      // Try to extract a query from the prompt for better alt text.
      const queryMatch = input.prompt.match(/(?:image|picture) of (?:a|an|the)?\s*([^.?!]*)/i);
      const query = queryMatch ? queryMatch[1].trim() : 'a visual representation';

      output.imageUrl = `https://placehold.co/600x400.png`;
      output.altText = `An image of ${query}`;
      output.dataAiHint = query.split(' ').slice(0, 2).join(' ');
    }

    return output;
  }
);
