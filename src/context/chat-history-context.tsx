'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import type { SelfReviewOutput } from '@/ai/flows/self-review';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

type Message = {
  id: string;
  role: 'You' | 'AI';
  content: string;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
  review?: SelfReviewOutput;
  createdAt?: Timestamp;
};

interface ChatHistoryContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  clearHistory: () => void;
  loadingHistory: boolean;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined
);

const LOCAL_HISTORY_KEY = 'chatHistory_guest';

const MOCK_DEVELOPMENT_DATA: Message[] = [
  {
    id: 'mock-1',
    role: 'AI',
    content: "Hi! I'm AIva. I've pre-loaded some messages to help you see how I look. I can manage your calendar, set alarms, and even generate cinematic videos!",
    createdAt: Timestamp.now(),
  },
  {
    id: 'mock-2',
    role: 'You',
    content: "Can you show me my calendar for this week?",
    createdAt: Timestamp.now(),
  },
  {
    id: 'mock-3',
    role: 'AI',
    content: "Certainly! You have a 'Product Launch Sync' on Tuesday at 10:00 AM and a 'Coffee with Sarah' on Friday at 3:00 PM. Would you like me to set a reminder for those?",
    createdAt: Timestamp.now(),
  }
];

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Fetch history
  useEffect(() => {
    if (authLoading) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        if (user) {
          const q = query(
            collection(db, 'users', user.uid, 'messages'),
            orderBy('createdAt', 'asc')
          );
          const querySnapshot = await getDocs(q);
          const firestoreMessages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          
          if (firestoreMessages.length === 0) {
            setMessages(MOCK_DEVELOPMENT_DATA);
          } else {
            setMessages(firestoreMessages);
          }
        } else {
          const storedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
          if (storedHistory) {
            setMessages(JSON.parse(storedHistory));
          } else {
            // Seed with mock data for new guest users
            setMessages(MOCK_DEVELOPMENT_DATA);
            localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(MOCK_DEVELOPMENT_DATA));
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load chat history.',
        });
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user, authLoading, toast]);


  // Add message
  const addMessage = useCallback(async (message: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage = {
      ...message,
      createdAt: Timestamp.now(),
      id: `temp-${Date.now()}`
    };
    
    setMessages((prev) => [...prev, newMessage]);

    try {
      if (user) {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'messages'), {
          ...message,
          createdAt: Timestamp.now(),
        });
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, id: docRef.id } : m));
      } else {
        const currentMessages = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
        const updatedHistory = [...currentMessages, newMessage];
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to save message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your message.',
      });
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  }, [user, toast]);


  // Clear history
  const clearHistory = useCallback(async () => {
    try {
      if (user) {
        const q = query(collection(db, 'users', user.uid, 'messages'));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } else {
        localStorage.removeItem(LOCAL_HISTORY_KEY);
      }
      setMessages([]);
      toast({
        title: 'History Cleared',
        description: 'Your conversation history has been cleared.',
      });
    } catch (error) {
       console.error('Failed to clear history:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not clear your history.',
      });
    }
  }, [user, toast]);

  return (
    <ChatHistoryContext.Provider
      value={{ messages, addMessage, clearHistory, loadingHistory }}
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
