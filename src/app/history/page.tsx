'use client';
import React from 'react';
import ChatMessage from '@/components/chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatHistory } from '@/context/chat-history-context';

export default function HistoryPage() {
  const { messages } = useChatHistory();

  return (
    <>
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">History</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">No History Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Your past conversations will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="py-8 px-4 space-y-8 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage key={i} {...msg} />
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </>
  );
}
