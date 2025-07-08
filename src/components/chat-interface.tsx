
"use client";

import { useEffect, useState, useRef } from "react";
import { AudioLines, Mic, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/chat-message";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { chat } from "@/ai/flows/chat";

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
      const { response } = await chat({ prompt });
      setMessages((prev) => [...prev, { role: "AI", content: response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "AI", content: `Sorry, I ran into an error. Please try again later.` }]);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get a response. Please check your connection and try again.`,
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
          <div className="bg-card rounded-2xl p-2 sm:p-3 shadow-sm border border-input">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Aiva..."
              className="bg-transparent border-0 focus-visible:ring-0 resize-none w-full p-2 text-base min-h-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="rounded-full text-muted-foreground border-border/60">
                  <Search className="h-4 w-4 mr-2" />
                  Research
                </Button>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={isDisabled || !input.trim()}
                  size="icon"
                  className="rounded-full w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
                >
                  <AudioLines className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Aiva can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
