
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader, Mic, Send, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/chat-message";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { geminiSwitchChat } from "@/ai/flows/gemini-switch-chat";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { enhancePrompt } from "@/ai/flows/enhance-prompt";
import { generateImage } from "@/ai/flows/generate-image";
import AttachmentMenu from "@/components/attachment-menu";
import { cn } from "@/lib/utils";
import { useChatHistory } from "@/context/chat-history-context";
import { tts } from "@/ai/flows/tts";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatInterface() {
  const { messages, addMessage, loadingHistory } = useChatHistory();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();

  const sendMessage = useCallback(async (prompt: string, options?: { performResearch?: boolean }) => {
    if (!prompt.trim()) return;

    const performResearch = options?.performResearch || false;
    const userMessageContent = performResearch ? `Research: ${prompt}` : prompt;
    const userMessage = { role: "You" as const, content: userMessageContent };

    const currentHistoryForAI = messages.map(msg => ({
      speaker: msg.role === 'You' ? 'You' : 'AIva' as const,
      text: msg.content,
    }));

    addMessage(userMessage);
    setInput("");
    setIsSending(true);
    
    try {
      const aiResponse = await geminiSwitchChat({ 
        prompt, 
        isOnline, 
        performResearch,
        history: currentHistoryForAI
      });
      addMessage({
        role: "AI",
        content: aiResponse.response,
        imageUrl: aiResponse.imageUrl,
        altText: aiResponse.altText,
        dataAiHint: aiResponse.dataAiHint,
        review: aiResponse.review,
      });
    } catch (error) {
      console.error(error);
      const errorMessage = performResearch
        ? `Sorry, I ran into an error during research. Please try again later.`
        : `Sorry, I ran into an error. Please try again later.`;
      addMessage({ role: "AI", content: errorMessage });
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get a response. Please check your connection and try again.`,
      });
    } finally {
      setIsSending(false);
    }
  }, [isOnline, toast, addMessage, messages]);


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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript); // Set input to transcript
          sendMessage(transcript); // And send it immediately
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            toast({
              variant: 'destructive',
              title: 'Speech Recognition Error',
              description: event.error === 'not-allowed' ? 'Microphone access was denied. Please enable it in your browser settings.' : `An error occurred: ${event.error}`,
            });
          }
           setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, [toast, sendMessage]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Feature Not Available',
        description: 'Speech recognition is not supported in your browser.',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleEnhancePrompt = useCallback(async () => {
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
  }, [input, isSending, isEnhancing, toast]);

  const handleGenerateImage = useCallback(async () => {
    if (!input.trim()) {
       toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter a prompt to generate an image.",
      });
      return;
    }

    const prompt = input;
    addMessage({ role: "You", content: `Create an image of: ${prompt}` });
    setInput("");
    setIsGeneratingImage(true);
    
    try {
      const imageResponse = await generateImage({ prompt });
      addMessage({ 
        role: "AI",
        content: `Here's the image you asked for.`,
        imageUrl: imageResponse.imageUrl,
        altText: imageResponse.altText,
      });
    } catch (error) {
      console.error(error);
      const errorMessage = `Sorry, I was unable to create an image for that prompt. Please try a different one.`;
      addMessage({ role: "AI", content: errorMessage });
      toast({
        variant: "destructive",
        title: "Image Generation Failed",
        description: `Could not generate the image.`,
      });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [input, addMessage, toast]);

  const handleWebSearch = useCallback(() => {
    if (!input.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter a topic to search on the web.",
      });
      return;
    }
    sendMessage(input, { performResearch: true });
  }, [input, sendMessage, toast]);
  
  const handlePlayAudio = useCallback(async (messageId: string, text: string) => {
    if (isSpeaking && currentlyPlayingId === messageId) {
      // If the same message is clicked while playing, stop it
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
      return;
    }

    setCurrentlyPlayingId(messageId);
    setIsSpeaking(true);
    try {
      const { media } = await tts({ text });
      if (audioRef.current) {
        audioRef.current.src = media;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setCurrentlyPlayingId(null);
        };
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast({ variant: 'destructive', title: 'Could not play audio' });
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
    }
  }, [isSpeaking, currentlyPlayingId, toast]);


  const isDisabled = isSending || isEnhancing || isRecording || isGeneratingImage || isSpeaking;
  const isMenuDisabled = isDisabled || !input.trim();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <main className="flex-1 overflow-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="py-8 px-4 space-y-8 max-w-3xl mx-auto">
             {loadingHistory ? (
                <div className="flex justify-center items-center h-full pt-20">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-center pt-20">
                  <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold mb-6">A</div>
                  <h1 className="text-3xl font-semibold">How can I help you today?</h1>
                </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  {...msg}
                  onPlayAudio={handlePlayAudio}
                  isSpeaking={isSpeaking && currentlyPlayingId === msg.id}
                />
              ))
            )}
            {(isSending || isGeneratingImage) && (
                <ChatMessage id="loading" role="AI" content="" isLoading={true} />
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 bg-background border-t">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Message Aiva..."}
              className="bg-card rounded-2xl shadow-sm border-input pr-24 pl-12 py-3 text-base min-h-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              <AttachmentMenu 
                disabled={isMenuDisabled}
                onGenerateImage={handleGenerateImage}
                onWebSearch={handleWebSearch}
              />
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn('rounded-full text-muted-foreground', {
                    'text-blue-500 animate-pulse': isRecording,
                  })}
                  onClick={handleMicClick} 
                  disabled={isSending || isEnhancing || isGeneratingImage || isSpeaking}
                  title="Voice Input"
                >
                  <Mic className="h-5 w-5" />
                </Button>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-muted-foreground"
                  onClick={handleEnhancePrompt}
                  disabled={isMenuDisabled}
                  title="Enhance Prompt"
                >
                  {isEnhancing ? <Loader className="h-5 w-5 animate-spin" /> : <SlidersHorizontal className="h-5 w-5" />}
                </Button>
              <Button
                  onClick={() => sendMessage(input)}
                  disabled={isDisabled || !input.trim()}
                  size="icon"
                  className="rounded-full w-8 h-8 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
                >
                  {isSending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Aiva can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
