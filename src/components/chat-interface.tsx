"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader, Mic, Send, SlidersHorizontal, X, Image as ImageIcon, Sparkles, Brain, Globe, Palette, Film, Telescope } from "lucide-react";
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
import { generateVideo } from "@/ai/flows/generate-video";
import { deepResearch } from "@/ai/flows/deep-research";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
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

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    toast({ title: "File Attached", description: `${file.name} is ready for analysis.` });
  }, [toast]);

  const clearSelections = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedFile(null);
  }, []);

  const sendMessage = useCallback(async (prompt: string, options?: { performResearch?: boolean, isDeep?: boolean }) => {
    if (!prompt.trim() && !imagePreview && !selectedFile) return;

    const { performResearch = false, isDeep = false } = options || {};
    let userMessageContent = prompt;
    if (performResearch) userMessageContent = `Research: ${prompt}`;
    if (isDeep) userMessageContent = `Deep Research: ${prompt}`;
    if (selectedFile) userMessageContent = `Analyze file (${selectedFile.name}): ${prompt}`;

    const attachmentUrl = imagePreview || undefined;

    addMessage({ 
      role: "You", 
      content: userMessageContent,
      imageUrl: attachmentUrl
    });

    setInput("");
    clearSelections();
    setIsSending(true);
    
    try {
      const currentHistoryForAI = messages.map(msg => ({
        speaker: msg.role === 'You' ? 'You' : 'AIva' as const,
        text: msg.content,
      }));

      // If it's deep research, use the specialized flow
      if (isDeep) {
        const { report } = await deepResearch({ topic: prompt });
        addMessage({ role: "AI", content: report });
      } else {
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
      }
    } catch (error) {
      console.error(error);
      addMessage({ role: "AI", content: "Sorry, I ran into an error. Please try again later." });
    } finally {
      setIsSending(false);
    }
  }, [isOnline, addMessage, messages, user, imagePreview, selectedFile, clearSelections]);

  const handleGenerateImage = useCallback(async () => {
    if (!input.trim()) return;
    const prompt = input;
    addMessage({ role: "You", content: `Create an image of: ${prompt}` });
    setInput("");
    setIsProcessingTask(true);
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
      setIsProcessingTask(false);
    }
  }, [input, addMessage]);

  const handleGenerateVideo = useCallback(async () => {
    if (!input.trim()) {
      toast({ title: "Prompt Required", description: "Please describe the video you want to generate." });
      return;
    }
    const prompt = input;
    addMessage({ role: "You", content: `Create a cinematic video of: ${prompt}` });
    setInput("");
    setIsProcessingTask(true);
    toast({ title: "Generating Video", description: "This may take up to a minute. Please stay on this page." });
    
    try {
      const { videoUrl, altText } = await generateVideo({ prompt });
      addMessage({ 
        role: "AI",
        content: `Your video is ready!`,
        // We'll treat videoUrl similarly to imageUrl for now in the UI logic
        imageUrl: videoUrl, 
        altText: altText,
      });
    } catch (error: any) {
      console.error(error);
      addMessage({ role: "AI", content: `Failed to generate video: ${error.message}` });
    } finally {
      setIsProcessingTask(false);
    }
  }, [input, addMessage, toast]);

  const handleWebSearch = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input, { performResearch: true });
  }, [input, sendMessage]);

  const handleDeepResearch = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input, { isDeep: true });
  }, [input, sendMessage]);
  
  const handleMicClick = () => {
    if (!recognitionRef.current) return;
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
      if (result.enhancedPrompt) setInput(result.enhancedPrompt);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  }, [input, isSending, isEnhancing]);

  const handlePlayAudio = useCallback(async (messageId: string, text: string) => {
    if (isSpeaking && currentlyPlayingId === messageId) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
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
        audioRef.current.onended = () => { setIsSpeaking(false); setCurrentlyPlayingId(null); };
      }
    } catch (error) {
      setIsSpeaking(false);
      setCurrentlyPlayingId(null);
    }
  }, [isSpeaking, currentlyPlayingId]);

  const isDisabled = isSending || isEnhancing || isRecording || isProcessingTask || isSpeaking;

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
                  <div className="h-16 w-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-xl">A</div>
                  <h1 className="text-3xl font-semibold mb-8">How can I help you today?</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                    {STARTER_PROMPTS.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(starter.text)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-all text-left group shadow-sm"
                      >
                        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
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
            {(isSending || isProcessingTask) && (
                <ChatMessage id="loading" role="AI" content="" isLoading={true} />
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 bg-background border-t flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {(imagePreview || selectedFile) && (
            <div className="mb-4 flex gap-2">
              {imagePreview && (
                <div className="relative inline-block">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border shadow-sm">
                    <Image src={imagePreview} alt="Upload preview" fill className="object-cover" />
                  </div>
                  <button onClick={clearSelections} className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"><X className="h-4 w-4" /></button>
                </div>
              )}
              {selectedFile && (
                <div className="relative inline-block">
                  <div className="h-20 w-32 flex flex-col items-center justify-center bg-muted rounded-lg border border-border p-2 gap-1">
                    <Telescope className="h-6 w-6 text-primary" />
                    <span className="text-[10px] font-medium truncate w-full text-center">{selectedFile.name}</span>
                  </div>
                  <button onClick={clearSelections} className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"><X className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Message AIva..."}
              className="bg-card rounded-2xl shadow-sm border-input pr-28 pl-24 py-3 text-base min-h-[52px] resize-none focus-visible:ring-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <AttachmentMenu 
                disabled={isDisabled}
                onGenerateImage={handleGenerateImage}
                onGenerateVideo={handleGenerateVideo}
                onWebSearch={handleWebSearch}
                onDeepResearch={handleDeepResearch}
                onImageSelect={handleImageSelect}
                onFileSelect={handleFileSelect}
              />
               <Button 
                  variant="ghost" size="icon" className={cn('rounded-full text-muted-foreground transition-colors', { 'text-blue-500 animate-pulse bg-blue-500/10': isRecording })}
                  onClick={handleMicClick} disabled={isDisabled} title="Voice Input"
                >
                  <Mic className="h-5 w-5" />
                </Button>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button 
                  variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={handleEnhancePrompt} disabled={isDisabled || !input.trim()} title="Enhance Prompt"
                >
                  {isEnhancing ? <Loader className="h-5 w-5 animate-spin" /> : <SlidersHorizontal className="h-5 w-5" />}
                </Button>
              <Button
                  onClick={() => sendMessage(input)} disabled={isDisabled || (!input.trim() && !imagePreview && !selectedFile)}
                  size="icon" className="rounded-full w-9 h-9 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted shadow-md transition-all active:scale-95"
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
