'use server';
/**
 * @fileOverview A hybrid chat AI agent that switches between online and offline models.
 *
 * - geminiSwitchChat - A function that handles a chat conversation, switching providers based on network status.
 * - GeminiSwitchChatInput - The input type for the function.
 * - GeminiSwitchChatOutput - The return type for the function.
 */

import { onlineChat, ChatOutput, ChatInput } from './chat';
import { z } from 'genkit';

const MessageSchema = z.object({
  speaker: z.enum(['You', 'AIva']),
  text: z.string(),
});

export type GeminiSwitchChatInput = ChatInput & {
  isOnline: boolean;
};

export type GeminiSwitchChatOutput = ChatOutput;


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
  const { prompt, isOnline, performResearch, history } = input;
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
