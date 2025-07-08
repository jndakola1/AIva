'use server';
/**
 * @fileOverview A hybrid chat AI agent that switches between online and offline models.
 *
 * - geminiSwitchChat - A function that handles a chat conversation, switching providers based on network status.
 * - GeminiSwitchChatInput - The input type for the function.
 * - GeminiSwitchChatOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { chat as onlineChat, ChatOutput } from './chat';

const GeminiSwitchChatInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
  isOnline: z.boolean().describe('The network status of the client.'),
  performResearch: z.boolean().optional().describe('Whether to force the use of the research tool.'),
});
export type GeminiSwitchChatInput = z.infer<typeof GeminiSwitchChatInputSchema>;

export type GeminiSwitchChatOutput = ChatOutput;

const GeminiSwitchChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
  imageUrl: z.string().optional().describe('The URL of an image to display, if requested.'),
  altText: z.string().optional().describe('The alt text for the image.'),
  dataAiHint: z.string().optional().describe('A hint for a real image search.'),
});

async function ollamaChat(prompt: string): Promise<GeminiSwitchChatOutput> {
  // In a real app, you would call the Ollama API here.
  // For this demo, we'll return a mock response.
  console.log(`Using mock Ollama for prompt: ${prompt}`);
  return {
    response: `I am currently offline and using the local Ollama model to respond. You said: "${prompt}"`,
  };
}

export async function geminiSwitchChat(
  input: GeminiSwitchChatInput
): Promise<GeminiSwitchChatOutput> {
  return geminiSwitchChatFlow(input);
}

const geminiSwitchChatFlow = ai.defineFlow(
  {
    name: 'geminiSwitchChatFlow',
    inputSchema: GeminiSwitchChatInputSchema,
    outputSchema: GeminiSwitchChatOutputSchema,
  },
  async ({ prompt, isOnline, performResearch }) => {
    if (isOnline) {
      return onlineChat({ prompt, performResearch });
    } else {
      // The offline model can't do research.
      return ollamaChat(prompt);
    }
  }
);
