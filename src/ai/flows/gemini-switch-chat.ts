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
import { getUserSettings, type PersonalitySettings } from '@/lib/user-settings';

const MessageSchema = z.object({
  speaker: z.enum(['You', 'AIva']),
  text: z.string(),
});

export type GeminiSwitchChatInput = Omit<ChatInput, 'personality'> & {
  isOnline: boolean;
  userId?: string;
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
        model: 'llama3', 
        prompt: prompt,
        stream: false,
        system: "You are a helpful, conversational AI assistant named Aiva. Respond naturally. Keep your responses concise."
      }),
    });

    if (!res.ok) {
        return {
            response: "Sorry, I'm having trouble connecting to the local AI model. Please ensure Ollama is running.",
        };
    }
    
    const data = await res.json();
    return {
      response: data.response || "Sorry, I received an unexpected response from the local AI model.",
    };
  } catch (error) {
    return {
      response: "It seems you're offline, but I can't reach the local AI model. Please make sure Ollama is running.",
    };
  }
}

export async function geminiSwitchChat(
  input: GeminiSwitchChatInput
): Promise<GeminiSwitchChatOutput> {
  const { prompt, isOnline, performResearch, history, userId, attachmentUrl } = input;
  if (isOnline) {
    let personality: PersonalitySettings | undefined;
    
    if (userId) {
      try {
        const userSettings = await getUserSettings(userId);
        personality = userSettings.personality;
      } catch (e) {
        console.error("Failed to fetch user settings.", e);
      }
    }

    const mappedHistory = history?.map(msg => ({
      role: msg.speaker,
      content: msg.text,
    }));
    
    return onlineChat({ 
      prompt, 
      performResearch, 
      history: mappedHistory, 
      personality,
      attachmentUrl,
    });
  } else {
    const historyString = history?.map(msg => `${msg.speaker}: ${msg.text}`).join('\n') || '';
    const fullPrompt = `${historyString}\nYou: ${prompt}\nAIva:`;
    return ollamaChat(fullPrompt);
  }
}