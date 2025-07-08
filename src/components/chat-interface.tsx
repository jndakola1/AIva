
"use client";

import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/chat-message";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  role: "You" | "AI";
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const promptFromQuery = searchParams.get('prompt');
    if (promptFromQuery) {
      setInput(decodeURIComponent(promptFromQuery));
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('prompt');
      router.replace(newUrl.toString(), { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { role: "You", content: prompt }]);
    setInput("");
    setIsSending(true);
    
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`API error: ${res.statusText} - ${errorData.error || 'No additional info'}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "AI", content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "AI", content: `Sorry, I ran into an error. Please check your API key and network connection.` }]);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get a response. Please check your connection and API key.`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const isDisabled = isSending;

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="py-8 px-4 space-y-8 max-w-3xl mx-auto">
            {messages.length === 0 && (
                <div className="flex flex-col h-full items-center justify-center text-center pt-20">
                  <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold mb-6">A</div>
                  <h1 className="text-3xl font-semibold">How can I help you today?</h1>
                </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {isSending && messages[messages.length-1]?.role === 'You' && (
                <ChatMessage role="AI" content="" isLoading={true} />
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Aiva..."
              className="pr-16 rounded-2xl resize-none p-4 border-border/60 bg-card focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <Button 
              onClick={() => sendMessage(input)} 
              disabled={isDisabled || !input.trim()} 
              size="icon" 
              className="absolute top-1/2 right-3 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-muted"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
           <p className="text-xs text-center text-muted-foreground mt-2">
            Aiva can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
