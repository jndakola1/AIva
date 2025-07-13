'use client';

import { useToast } from '@/hooks/use-toast';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { SelfReviewOutput } from '@/ai/flows/self-review';

type Message = {
  id: string;
  role: 'You' | 'AI';
  content: string;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
  review?: SelfReviewOutput;
};

interface ChatHistoryContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearHistory: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined
);

const HISTORY_STORAGE_KEY = 'chatHistory';

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load chat history from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      // Don't save initial empty array
      if (messages.length > 0) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Failed to save chat history to localStorage', error);
    }
  }, [messages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setMessages([]);
    toast({
      title: 'History Cleared',
      description: 'Your conversation history has been cleared.',
    });
  }, [toast]);

  return (
    <ChatHistoryContext.Provider
      value={{ messages, addMessage, clearHistory }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
