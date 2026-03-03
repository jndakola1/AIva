
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader, Mic, Send, SlidersHorizontal, X, Image as ImageIcon, Sparkles, Brain, Globe, Palette, Film, Telescope, Music, Zap } from "lucide-react";
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
import { generateMusic } from "@/ai/flows/generate-music";
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
  { icon: Zap, text: "Give me my daily briefing.", color: "text-primary bg-primary/10 border-primary/20" },
  { icon: Sparkles, text: "Create a cinematic video of a futuristic forest.", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { icon: Brain, text: "Explain quantum physics to a five-year-old.", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { icon: Telescope, text: "Perform deep research on neural synthesis.", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
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
  const [currentTaskLabel, setCurrentTaskLabel] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const { user } = useAuth();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, isProcessingTask, scrollToBottom]);

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
    if (isDeep) {
        setCurrentTaskLabel("Synthesizing research data...");
        setIsProcessingTask(true);
    }
    
    try {
      const currentHistoryForAI = messages.map(msg => ({
        speaker: msg.role === 'You' ? 'You' : 'AIva' as const,
        text: msg.content,
      }));

      if (isDeep) {
        const { report } = await deepResearch({ topic: prompt });
        addMessage({ role: "AIva", content: report });
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
          role: "AIva",
          content: aiResponse.response,
          imageUrl: aiResponse.imageUrl,
          altText: aiResponse.altText,
          dataAiHint: aiResponse.dataAiHint,
          review: aiResponse.review,
          toolData: aiResponse.toolData,
        });
      }
    } catch (error) {
      console.error(error);
      addMessage({ role: "AIva", content: "Sorry, I ran into an error. Please try again later." });
    } finally {
      setIsSending(false);
      setIsProcessingTask(false);
      setCurrentTaskLabel(null);
    }
  }, [isOnline, addMessage, messages, user, imagePreview, selectedFile, clearSelections]);

  const handleGenerateImage = useCallback(async () => {
    if (!input.trim()) return;
    const prompt = input;
    addMessage({ role: "You", content: `Create an image of: ${prompt}` });
    setInput("");
    setIsProcessingTask(true);
    setCurrentTaskLabel("Gemini is painting your vision...");
    try {
      const imageResponse = await generateImage({ prompt });
      addMessage({ 
        role: "AIva",
        content: `Here's the image you asked for.`,
        imageUrl: imageResponse.imageUrl,
        altText: imageResponse.altText,
      });
    } catch (error) {
      addMessage({ role: "AIva", content: `Failed to generate image.` });
    } finally {
      setIsProcessingTask(false);
      setCurrentTaskLabel(null);
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
    setCurrentTaskLabel("Veo 3 PRO is synthesizing cinematic motion with spatial audio...");
    
    try {
      const { videoUrl, altText } = await generateVideo({ prompt });
      addMessage({ 
        role: "AIva",
        content: `Your cinematic motion sequence with spatial sound is ready for review.`,
        imageUrl: videoUrl, 
        altText: altText,
      });
    } catch (error: any) {
      console.error(error);
      addMessage({ role: "AIva", content: `Motion Engine Error: ${error.message}` });
    } finally {
      setIsProcessingTask(false);
      setCurrentTaskLabel(null);
    }
  }, [input, addMessage, toast]);

  const handleGenerateMusic = useCallback(async () => {
    if (!input.trim()) {
      toast({ title: "Prompt Required", description: "Please describe the music you want to generate." });
      return;
    }
    const prompt = input;
    addMessage({ role: "You", content: `Compose AI music for: ${prompt}` });
    setInput("");
    setIsProcessingTask(true);
    setCurrentTaskLabel("Neural Studio is mastering unique audio layers...");
    
    try {
      const { audioUrl, description } = await generateMusic({ prompt });
      addMessage({ 
        role: "AIva",
        content: `I've mastered a new spatial audio track: ${description}`,
        imageUrl: audioUrl,
      });
    } catch (error: any) {
      console.error(error);
      addMessage({ role: "AIva", content: `Audio Synthesis Error: ${error.message}` });
    } finally {
      setIsProcessingTask(false);
      setCurrentTaskLabel(null);
    }
  }, [input, addMessage, toast]);

  const handleDailyBriefing = useCallback(() => {
    sendMessage("Give me my daily briefing.");
  }, [sendMessage]);

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
    <div className="flex flex-col h-full bg-[#0A0A0B] text-foreground relative overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="py-12 px-6 space-y-12 max-w-4xl mx-auto pb-48">
             {loadingHistory ? (
                <div className="flex justify-center items-center h-full pt-20">
                  <Loader className="h-10 w-10 animate-spin text-primary/40" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-center pt-20 animate-in fade-in duration-700">
                  <div className="h-24 w-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-4xl font-bold mb-8 shadow-[0_0_40px_rgba(217,119,87,0.5)] rotate-3">A</div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Hello. I'm AIva.</h1>
                  <p className="text-muted-foreground mb-12 text-lg max-w-md mx-auto">Your high-performance AI companion, powered by Gemini and Veo.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4">
                    {STARTER_PROMPTS.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(starter.text)}
                        className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left group shadow-lg"
                      >
                        <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform border", starter.color)}>
                          <starter.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{starter.text}</span>
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
            
            {isProcessingTask && currentTaskLabel && (
                <div className="flex flex-col items-center justify-center gap-4 py-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-4 px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl shadow-[0_0_30px_rgba(217,119,87,0.2)] backdrop-blur-xl">
                        <Loader className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{currentTaskLabel}</span>
                    </div>
                </div>
            )}

            {(isSending && !isProcessingTask) && (
                <ChatMessage id="loading" role="AIva" content="" isLoading={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </main>

      {/* Glass Pill Input Area */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent pointer-events-none z-10">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {(imagePreview || selectedFile) && (
            <div className="mb-4 flex gap-3 animate-in slide-in-from-bottom-6 duration-500">
              {imagePreview && (
                <div className="relative inline-block">
                  <div className="relative h-24 w-24 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group">
                    <Image src={imagePreview} alt="Upload preview" fill className="object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <button onClick={clearSelections} className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors border-2 border-[#0A0A0B]"><X className="h-4 w-4" /></button>
                </div>
              )}
              {selectedFile && (
                <div className="relative inline-block">
                  <div className="h-24 w-36 flex flex-col items-center justify-center bg-white/5 rounded-3xl border-2 border-white/10 p-3 gap-2 shadow-2xl">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <Telescope className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate w-full text-center text-white/60">{selectedFile.name}</span>
                  </div>
                  <button onClick={clearSelections} className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors border-2 border-[#0A0A0B]"><X className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          )}
          
          <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all focus-within:border-primary/40 focus-within:shadow-[0_20px_50px_rgba(217,119,87,0.15)] ring-1 ring-white/5">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "Listening to you..." : "Message AIva..."}
              className="bg-transparent border-none rounded-[2.5rem] pr-32 pl-24 py-5 text-base md:text-lg min-h-[64px] resize-none focus-visible:ring-0 shadow-none no-scrollbar font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <AttachmentMenu 
                disabled={isDisabled}
                onGenerateImage={handleGenerateImage}
                onGenerateVideo={handleGenerateVideo}
                onGenerateMusic={handleGenerateMusic}
                onWebSearch={handleWebSearch}
                onDeepResearch={handleDeepResearch}
                onDailyBriefing={handleDailyBriefing}
                onImageSelect={handleImageSelect}
                onFileSelect={handleFileSelect}
              />
               <Button 
                  variant="ghost" size="icon" className={cn('rounded-full text-white/40 hover:text-primary transition-all h-11 w-11', { 'text-primary animate-pulse bg-primary/10 shadow-[0_0_15px_rgba(217,119,87,0.4)]': isRecording })}
                  onClick={handleMicClick} disabled={isDisabled}
                >
                  <Mic className="h-5 w-5" />
                </Button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button 
                  variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all h-11 w-11"
                  onClick={handleEnhancePrompt} disabled={isDisabled || !input.trim()}
                >
                  {isEnhancing ? <Loader className="h-5 w-5 animate-spin" /> : <SlidersHorizontal className="h-5 w-5" />}
                </Button>
              <Button
                  onClick={() => sendMessage(input)} disabled={isDisabled || (!input.trim() && !imagePreview && !selectedFile)}
                  size="icon" className="rounded-2xl w-11 h-11 bg-primary text-white hover:bg-primary/90 disabled:bg-white/5 disabled:text-white/20 shadow-xl transition-all active:scale-90"
                >
                  {isSending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-white/20 mt-4 uppercase tracking-[0.3em] font-bold">
            AIva Context Engine v1.2
          </p>
        </div>
      </footer>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
