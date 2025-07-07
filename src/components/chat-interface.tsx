"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Sparkles, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/chat-message";
import { enhancePrompt } from "@/ai/flows/enhance-prompt";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "You" | "AI";
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      setIsOffline(!navigator.onLine);
    }

    return () => {
      if (typeof window !== "undefined" && typeof navigator !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

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

    let responseText = "";
    
    try {
      if (!isOffline) {
        const res = await fetch("/api/gemini", {
          method: "POST",
          body: JSON.stringify({ prompt }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Gemini API error: ${res.statusText} - ${errorData.error || 'No additional info'}`);
        }

        const data = await res.json();
        responseText = data.response;
      } else {
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          body: JSON.stringify({
            model: "tinyllama",
            prompt,
            stream: false,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!res.ok) {
          throw new Error(`Ollama API error: ${res.statusText}`);
        }

        const data = await res.json();
        responseText = data.response;
      }
      setMessages((prev) => [...prev, { role: "AI", content: responseText }]);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages((prev) => [...prev, { role: "AI", content: `Sorry, I ran into an error. Please check the console for details.` }]);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get a response. ${isOffline ? "Please ensure Ollama is running." : "Please check your connection and API key."}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim()) return;
    setIsSending(true);
    try {
      const result = await enhancePrompt({ prompt: input });
      setInput(result.enhancedPrompt);
    } catch (error) {
       console.error("Failed to enhance prompt:", error);
       toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: "Could not enhance the prompt. This is an online-only feature.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between p-4 border-b shadow-sm">
        <h1 className="text-xl font-headline font-bold text-primary">Gemini Switch</h1>
        <Badge variant={isOffline ? "destructive" : "default"} className="flex items-center gap-2">
          {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4 text-green-500" />}
          <span className="font-semibold">{isOffline ? "Offline Mode (Ollama)" : "Online Mode (Gemini)"}</span>
        </Badge>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-muted-foreground pt-32">
                    <p className="text-lg">Start a conversation by typing below.</p>
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

      <footer className="p-4 border-t bg-card/50">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="pr-28 min-h-[48px] rounded-full resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={isSending}
            rows={1}
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleEnhancePrompt} disabled={isSending || !input.trim() || isOffline} title="Enhance Prompt (Online only)">
              <Sparkles className="h-5 w-5 text-accent" />
            </Button>
            <Button onClick={() => sendMessage(input)} disabled={isSending || !input.trim()} size="icon" className="rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
