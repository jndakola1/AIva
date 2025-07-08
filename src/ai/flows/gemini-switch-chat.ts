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
import { chat as onlineChat } from './chat';

const GeminiSwitchChatInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
  isOnline: z.boolean().describe('The network status of the client.'),
});
export type GeminiSwitchChatInput = z.infer<typeof GeminiSwitchChatInputSchema>;

const GeminiSwitchChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type GeminiSwitchChatOutput = z.infer<typeof GeminiSwitchChatOutputSchema>;

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
  async ({ prompt, isOnline }) => {
    if (isOnline) {
      return onlineChat({ prompt });
    } else {
      return ollamaChat(prompt);
    }
  }
);
