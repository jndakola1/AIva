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
  where,
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

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Fetch history
  useEffect(() => {
    if (authLoading) return; // Wait for auth state to be determined

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        if (user) {
          // USER IS LOGGED IN: Fetch from Firestore
          const q = query(
            collection(db, 'users', user.uid, 'messages'),
            orderBy('createdAt', 'asc')
          );
          const querySnapshot = await getDocs(q);
          const firestoreMessages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          setMessages(firestoreMessages);
        } else {
          // USER IS GUEST: Fetch from localStorage
          const storedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
          if (storedHistory) {
            setMessages(JSON.parse(storedHistory));
          } else {
            setMessages([]);
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
      id: `temp-${Date.now()}` // Temporary ID for UI
    };
    
    setMessages((prev) => [...prev, newMessage]);

    try {
      if (user) {
        // USER IS LOGGED IN: Save to Firestore
        const docRef = await addDoc(collection(db, 'users', user.uid, 'messages'), {
          ...message,
          createdAt: Timestamp.now(),
        });
        // Update message with real ID from Firestore
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, id: docRef.id } : m));
      } else {
        // USER IS GUEST: Save to localStorage
        const updatedHistory = [...messages, newMessage];
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to save message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your message.',
      });
      // Rollback UI update on error
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  }, [user, messages, toast]);


  // Clear history
  const clearHistory = useCallback(async () => {
    try {
      if (user) {
        // USER IS LOGGED IN: Delete from Firestore
        const q = query(collection(db, 'users', user.uid, 'messages'));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } else {
        // USER IS GUEST: Clear localStorage
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
