
"use client";

import { useEffect, useState, useRef } from "react";
import { Loader, Mic, Plus, Search, Send, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/chat-message";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { geminiSwitchChat } from "@/ai/flows/gemini-switch-chat";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { enhancePrompt } from "@/ai/flows/enhance-prompt";

type Message = {
  role: "You" | "AI";
  content: string;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();

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

  const sendMessage = async (prompt: string, options?: { performResearch?: boolean }) => {
    if (!prompt.trim()) return;

    const performResearch = options?.performResearch || false;
    const userMessage = performResearch ? `Research: ${prompt}` : prompt;

    setMessages((prev) => [...prev, { role: "You", content: userMessage }]);
    setInput("");
    setIsSending(true);
    
    try {
      const aiResponse = await geminiSwitchChat({ prompt, isOnline, performResearch });
      setMessages((prev) => [...prev, { 
        role: "AI",
        content: aiResponse.response,
        imageUrl: aiResponse.imageUrl,
        altText: aiResponse.altText,
        dataAiHint: aiResponse.dataAiHint,
      }]);
    } catch (error) {
      console.error(error);
      const errorMessage = performResearch
        ? `Sorry, I ran into an error during research. Please try again later.`
        : `Sorry, I ran into an error. Please try again later.`;
      setMessages((prev) => [...prev, { role: "AI", content: errorMessage }]);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get a response. Please check your connection and try again.`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isSending || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const result = await enhancePrompt({ prompt: input });
      if (result.enhancedPrompt) {
        setInput(result.enhancedPrompt);
      }
      toast({
        title: "Prompt Enhanced",
        description: "Your prompt has been improved.",
      });
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: "Could not enhance the prompt. Please try again.",
      });
    } finally {
      setIsEnhancing(false);
    }
  };


  const isDisabled = isSending || isEnhancing;

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
              <ChatMessage key={i} {...msg} />
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
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" disabled={isDisabled}>
                  <Plus className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-muted-foreground"
                  onClick={handleEnhancePrompt}
                  disabled={isDisabled || !input.trim()}
                  title="Enhance Prompt"
                >
                  {isEnhancing ? <Loader className="h-5 w-5 animate-spin" /> : <SlidersHorizontal className="h-5 w-5" />}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full text-muted-foreground border-border/60"
                  onClick={() => sendMessage(input, { performResearch: true })}
                  disabled={isDisabled || !input.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Research
                </Button>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" disabled={isDisabled}>
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={isDisabled || !input.trim()}
                  size="icon"
                  className="rounded-full w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
                >
                  {isSending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
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
