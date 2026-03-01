'use client';
import React, { useState } from 'react';
import ChatMessage from '@/components/chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatHistory } from '@/context/chat-history-context';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const { messages, clearHistory, loadingHistory } = useChatHistory();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      await clearHistory();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="p-4 border-b flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-semibold">History</h1>
        {messages.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear all history?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your entire conversation history with AIva from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAll} 
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </header>
      <main className="flex-1 overflow-hidden">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Your history is clear</h2>
              <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                Any conversations you have with AIva will be stored here for you to revisit later.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="py-8 px-4 space-y-8 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} {...msg} />
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </>
  );
}
