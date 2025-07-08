'use server';
/**
 * @fileOverview A simple chat AI agent that can also display images.
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


const ChatInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
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
  tools: [searchForImageTool],
  prompt: `You are a helpful AI assistant named Aiva. Respond to the following prompt concisely. If the user asks to see an image or a picture of something, use the searchForImage tool. When you use the tool, its output will be provided back to you. Use that information to formulate your final response in the required JSON format, including the imageUrl, altText, and dataAiHint if a tool was used. Also provide a short text response, like "Of course, here is a picture of a cat."

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
