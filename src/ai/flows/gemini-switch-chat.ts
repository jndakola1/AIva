'use server';
/**
 * @fileOverview A hybrid chat AI agent that switches between online and offline models.
 *
 * - geminiSwitchChat - A function that handles a chat conversation, switching providers based on network status.
 * - GeminiSwitchChatInput - The input type for the function.
 * - GeminiSwitchChatOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { chat as onlineChat, ChatOutput } from './chat';
import type { SelfReviewOutput } from './self-review';

const MessageSchema = z.object({
  speaker: z.enum(['You', 'AIva']),
  text: z.string(),
});

const GeminiSwitchChatInputSchema = z.object({
  prompt: z.string().describe('The user prompt.'),
  isOnline: z.boolean().describe('The network status of the client.'),
  performResearch: z.boolean().optional().describe('Whether to force the use of the research tool.'),
  history: z.array(MessageSchema).optional().describe('The conversation history.'),
});
export type GeminiSwitchChatInput = z.infer<typeof GeminiSwitchChatInputSchema>;

export type GeminiSwitchChatOutput = ChatOutput;

const GeminiSwitchChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
  imageUrl: z.string().optional().describe('The URL of an image to display, if requested.'),
  altText: z.string().optional().describe('The alt text for the image.'),
  dataAiHint: z.string().optional().describe('A hint for a real image search.'),
  review: z.object({
    summaryEvaluation: z.enum(['Good', 'Needs Improvement']),
    issuesFound: z.string().optional(),
    suggestedFixes: z.string().optional(),
    finalVerdict: z.enum(['Use as-is', 'Revise']),
  }).optional(),
});

async function ollamaChat(prompt: string): Promise<GeminiSwitchChatOutput> {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // Using a more common default model
        prompt: prompt,
        stream: false,
        system: "You are a helpful, conversational AI assistant named Aiva. Respond naturally as if you are in a voice conversation. Keep your responses concise."
      }),
    });

    if (!res.ok) {
        console.error("Ollama API Error:", res.status, res.statusText);
        return {
            response: "Sorry, I'm having trouble connecting to the local AI model. Please ensure Ollama is running.",
        };
    }
    
    const data = await res.json();

    if (!data.response) {
      console.error("Invalid Ollama response format:", data);
      return {
          response: "Sorry, I received an unexpected response from the local AI model."
      }
    }

    return {
      response: data.response,
    };
  } catch (error) {
    console.error('Failed to fetch from Ollama:', error);
    return {
      response: "It seems you're offline, but I can't reach the local AI model. Please make sure Ollama is running on your machine.",
    };
  }
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
  async ({ prompt, isOnline, performResearch, history }) => {
    if (isOnline) {
      const mappedHistory = history?.map(msg => ({
        role: msg.speaker,
        content: msg.text,
      }));
      return onlineChat({ prompt, performResearch, history: mappedHistory });
    } else {
      const historyString = history?.map(msg => `${msg.speaker}: ${msg.text}`).join('\n') || '';
      const fullPrompt = `${historyString}\nYou: ${prompt}\nAIva:`;
      return ollamaChat(fullPrompt);
    }
  }
);
