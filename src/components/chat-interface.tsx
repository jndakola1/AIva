"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader, Mic, Send, SlidersHorizontal, X, Image as ImageIcon, Sparkles, Brain, Globe, Palette } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const STARTER_PROMPTS = [
  { icon: Sparkles, text: "Write a short story about a time-traveling cat." },
  { icon: Brain, text: "Explain quantum physics to a five-year-old." },
  { icon: Globe, text: "What are the top travel destinations for 2024?" },
  { icon: Palette, text: "Give me creative ideas for a DIY home office setup." },
];

export default function ChatInterface() {
  const { messages, addMessage, loadingHistory } = useChatHistory();
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  const { user } = useAuth();

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImageSelection = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const sendMessage = useCallback(async (prompt: string, options?: { performResearch?: boolean }) => {
    if (!prompt.trim() && !imagePreview) return;

    const performResearch = options?.performResearch || false;
    const userMessageContent = performResearch ? `Research: ${prompt}` : prompt;
    
    // Convert preview to final attachment URL if exists
    const attachmentUrl = imagePreview || undefined;

    addMessage({ 
      role: "You", 
      content: userMessageContent,
      imageUrl: attachmentUrl // Display the uploaded image in the message history
    });

    setInput("");
    clearImageSelection();
    setIsSending(true);
    
    try {
      const currentHistoryForAI = messages.map(msg => ({
        speaker: msg.role === 'You' ? 'You' : 'AIva' as const,
        text: msg.content,
      }));

      const aiResponse = await geminiSwitchChat({ 
        prompt, 
        isOnline, 
        performResearch,
        history: currentHistoryForAI,
        userId: user?.uid,
        attachmentUrl,
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
      addMessage({ role: "AI", content: "Sorry, I ran into an error. Please try again later." });
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not get a response.`,
      });
    } finally {
      setIsSending(false);
    }
  }, [isOnline, toast, addMessage, messages, user, imagePreview, clearImageSelection]);


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
          setInput(transcript);
          sendMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            toast({
              variant: 'destructive',
              title: 'Speech Recognition Error',
              description: event.error === 'not-allowed' ? 'Microphone access was denied.' : `An error occurred: ${event.error}`,
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
      toast({ variant: 'destructive', title: 'Feature Not Available' });
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
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
    } finally {
      setIsEnhancing(false);
    }
  }, [input, isSending, isEnhancing]);

  const handleGenerateImage = useCallback(async () => {
    if (!input.trim()) return;
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
      addMessage({ role: "AI", content: `Failed to generate image.` });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [input, addMessage]);

  const handleWebSearch = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input, { performResearch: true });
  }, [input, sendMessage]);
  
  const handlePlayAudio = useCallback(async (messageId: string, text: string) => {
    if (isSpeaking && currentlyPlayingId === messageId) {
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
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
    }
  }, [isSpeaking, currentlyPlayingId]);


  const isDisabled = isSending || isEnhancing || isRecording || isGeneratingImage || isSpeaking;

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
                <div className="flex flex-col h-full items-center justify-center text-center pt-10">
                  <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold mb-6">A</div>
                  <h1 className="text-3xl font-semibold mb-8">How can I help you today?</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                    {STARTER_PROMPTS.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(starter.text)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left"
                      >
                        <div className="p-2 bg-muted rounded-lg">
                          <starter.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{starter.text}</span>
                      </button>
                    ))}
                  </div>
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

      <footer className="p-4 bg-background border-t flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border shadow-sm">
                <Image src={imagePreview} alt="Upload preview" fill className="object-cover" />
              </div>
              <button 
                onClick={clearImageSelection}
                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Message AIva..."}
              className="bg-card rounded-2xl shadow-sm border-input pr-28 pl-24 py-3 text-base min-h-[48px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <AttachmentMenu 
                disabled={isDisabled}
                onGenerateImage={handleGenerateImage}
                onWebSearch={handleWebSearch}
                onImageSelect={handleImageSelect}
              />
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn('rounded-full text-muted-foreground', {
                    'text-blue-500 animate-pulse': isRecording,
                  })}
                  onClick={handleMicClick} 
                  disabled={isDisabled}
                  title="Voice Input"
                >
                  <Mic className="h-5 w-5" />
                </Button>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                  onClick={() => sendMessage(input)}
                  disabled={isDisabled || (!input.trim() && !imagePreview)}
                  size="icon"
                  className="rounded-full w-8 h-8 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
                >
                  {isSending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </footer>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}