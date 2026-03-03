'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sparkles,
  Video,
  X,
  VideoOff,
  Mic,
  Loader2,
  RotateCcw,
  Eye,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiSwitchChat } from '@/ai/flows/gemini-switch-chat';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { tts } from '@/ai/flows/tts';
import { summarize } from '@/ai/flows/summarize';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { describeImage } from '@/ai/flows/describe-image';
import ChatMessage from '@/components/chat-message';
import { useAuth } from '@/hooks/use-auth';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type ConversationMessage = {
  id: string;
  speaker: 'You' | 'AIva';
  text: string;
  toolData?: any;
  imageUrl?: string;
};

export default function LiveVideoPage() {
  const [hasPermissions, setHasPermissions] = useState<boolean | undefined>(undefined);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const { user } = useAuth();

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isAIThinking, scrollToBottom]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text) return Promise.resolve();
    try {
      const { media } = await tts({ text });
      return new Promise<void>((resolve) => {
          if (audioRef.current) {
            audioRef.current.src = media;
            audioRef.current.play();
            audioRef.current.onended = () => resolve();
            audioRef.current.onerror = () => {
              console.error("Audio playback error.");
              resolve(); 
            }
          } else {
            resolve();
          }
      });
    } catch (error) {
      console.error("TTS Error:", error);
      toast({ variant: "destructive", title: "Could not play audio" });
      return Promise.resolve();
    }
  }, [toast]);
  
  const handleStartOver = useCallback(async () => {
    setConversation([]);
    setSummary(null);
    setIsListening(false);
    setIsAIThinking(false);
    setChatEnded(false); 
    setHasPermissions(undefined); 
  }, []);

  const getMediaStream = useCallback(async (deviceId?: string) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
      audio: true
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      setHasPermissions(false);
      toast({
        variant: 'destructive',
        title: 'Media Access Denied',
        description: 'Please enable camera and microphone permissions in your browser settings.',
      });
      return null;
    }
  }, [toast]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasPermissions(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermissions(true);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasPermissions(false);
      }
    };

    if (hasPermissions === undefined) {
      requestPermissions();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [hasPermissions]);

  useEffect(() => {
    const setupMediaAndGreet = async () => {
      if (hasPermissions && !chatEnded) {
        const stream = await getMediaStream();
        if (stream) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter(device => device.kind === 'videoinput');
          setVideoDevices(videoInputs);
          
          if (conversation.length === 0) {
            setIsAIThinking(true);
            await speak("Neural Intercept Active. Scanning visual feed. I am AIva, how can I assist your mission?");
            setIsAIThinking(false);
          }
        }
      }
    };
    setupMediaAndGreet();
  }, [hasPermissions, chatEnded, getMediaStream, speak, conversation.length]);

  const handleSwitchCamera = useCallback(async () => {
    if (videoDevices.length < 2) {
      toast({
        title: "No Other Camera Found",
        description: "Only one camera is available.",
      });
      return;
    }
    const nextDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
    await getMediaStream(videoDevices[nextDeviceIndex].deviceId);
    setCurrentDeviceIndex(nextDeviceIndex);
  }, [videoDevices, currentDeviceIndex, toast, getMediaStream]);

  useEffect(() => {
    if (typeof window !== 'undefined' && hasPermissions) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = async (event: any) => {
          const userSpeech = event.results[0][0].transcript;
          
          const historyForAI = conversation.map(msg => ({
            speaker: msg.speaker,
            text: msg.text,
          }));

          setConversation((prev) => [...prev, { id: `u-${Date.now()}`, speaker: 'You', text: userSpeech }]);
          setIsAIThinking(true);

          try {
            const aiOutput = await geminiSwitchChat({ 
              prompt: userSpeech, 
              isOnline, 
              performResearch: false,
              history: historyForAI,
              userId: user?.uid,
            });

            if (aiOutput.response) {
              setConversation((prev) => [...prev, { 
                id: `ai-${Date.now()}`, 
                speaker: 'AIva', 
                text: aiOutput.response,
                toolData: aiOutput.toolData,
                imageUrl: aiOutput.imageUrl,
              }]);
              await speak(aiOutput.response);
            } else {
              const errorMsg = "Core Logic Fault. Analysis interrupted. Please restate.";
              setConversation((prev) => [...prev, { id: `ai-err-${Date.now()}`, speaker: 'AIva', text: errorMsg }]);
              await speak(errorMsg);
            }
          } catch (error) {
            console.error(error);
            const errorMsg = "Neural Sync Failure. Rerouting through local core.";
            setConversation((prev) => [...prev, { id: `ai-err-${Date.now()}`, speaker: 'AIva', text: errorMsg }]);
            await speak(errorMsg);
          } finally {
            setIsAIThinking(false);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            toast({
              variant: 'destructive',
              title: 'Speech Recognition Error',
              description: event.error === 'not-allowed' ? 'Microphone access denied.' : `An error occurred: ${event.error}`,
            });
          }
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [isOnline, speak, toast, conversation, hasPermissions, user?.uid]);
  
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const handleTalkClick = () => {
    if (!recognitionRef.current) {
      toast({ variant: 'destructive', title: 'Feature Not Available' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleDescribeScene = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({ variant: 'destructive', title: 'Video not ready' });
      return;
    }

    setIsAIThinking(true);
    setConversation((prev) => [...prev, { id: `u-desc-${Date.now()}`, speaker: 'You', text: '[ Visual Analysis Requested ]' }]);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUri = canvas.toDataURL('image/jpeg');
      
      try {
        const { description } = await describeImage({ imageDataUri });
        setConversation((prev) => [...prev, { id: `ai-desc-${Date.now()}`, speaker: 'AIva', text: description }]);
        await speak(description);
      } catch (error) {
        console.error("Describe Scene Error:", error);
        const errorMsg = "Optical parsing failed. Signal interference detected.";
        setConversation((prev) => [...prev, { id: `ai-desc-err-${Date.now()}`, speaker: 'AIva', text: errorMsg }]);
        await speak(errorMsg);
      } finally {
        setIsAIThinking(false);
      }
    } else {
      setIsAIThinking(false);
    }
  };

  const handleEndChat = async () => {
    setChatEnded(true);
    setIsAIThinking(true);
    
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }

    const fullConversation = conversation.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
    
    try {
      await speak("Neural synthesis complete. Generating mission debrief.");
      const result = await summarize({ conversation: fullConversation });
      setSummary(result.summary);
    } catch (error) {
      console.error("Summarization Error:", error);
      const errorMsg = "Summary synthesis failed.";
      setSummary(errorMsg);
      await speak(errorMsg);
    } finally {
      setIsAIThinking(false);
    }
  };

  if (hasPermissions === undefined) {
    return <div className="flex h-screen w-full items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (hasPermissions === false) {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-black">
            <Alert variant="destructive" className="max-w-sm bg-gray-900 border-primary/20 text-white">
                <AlertTitle>Neural Feed Blocked</AlertTitle>
                <AlertDescription>
                Unauthorized terminal access. Please enable camera and microphone permissions to initialize the visual link.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (chatEnded) {
    return (
      <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4 tracking-tighter uppercase">Mission Debrief</h1>
        <Card className="w-full max-w-2xl holographic-glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              Intelligence Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAIThinking && !summary ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-primary font-bold uppercase tracking-widest text-xs">Synthesizing...</p>
              </div>
            ) : (
              <ScrollArea className="h-64 pr-4">
                <p className="whitespace-pre-wrap text-foreground font-medium leading-relaxed">{summary}</p>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button onClick={handleStartOver} size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 text-lg px-10 shadow-2xl shadow-primary/30">
              <RotateCcw className="mr-3 h-6 w-6" />
              Initialize New Feed
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          isCameraOn ? "opacity-100" : "opacity-0"
        )}
        autoPlay
        muted
        playsInline
      />

      {/* Holographic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent bg-[length:100%_4px] animate-[scanlines_10s_linear_infinite]" />
          <div className="absolute inset-0 border-[20px] border-primary/10 rounded-[4rem] shadow-[inset_0_0_100px_rgba(var(--primary),0.2)]" />
      </div>

      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-white z-10">
          <VideoOff className="h-24 w-24 mb-4 text-primary opacity-40" />
          <p className="text-xl uppercase font-bold tracking-widest text-primary/40">Optical Feed Disabled</p>
        </div>
      )}

      {/* Holographic Conversation Overlay */}
      <div className="absolute top-0 left-0 p-4 h-1/2 w-full md:w-2/5 lg:w-1/3 z-10">
          <Card className="h-full holographic-glass border-white/10 text-white overflow-hidden shadow-2xl">
              <CardHeader className="py-3 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-60 flex items-center gap-2">
                        <Zap className="h-3 w-3 text-primary animate-pulse" />
                        Intelligence Feed
                    </CardTitle>
                    <div className="flex gap-1">
                        <div className="h-1 w-4 bg-primary/40 rounded-full" />
                        <div className="h-1 w-2 bg-primary/20 rounded-full" />
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] p-0">
                  <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
                      <div className="space-y-6 pb-10">
                          {conversation.map((msg) => (
                              <ChatMessage 
                                key={msg.id} 
                                id={msg.id}
                                role={msg.speaker === 'AIva' ? 'AIva' : 'You'}
                                content={msg.text}
                                toolData={msg.toolData}
                                imageUrl={msg.imageUrl}
                              />
                          ))}
                           {isAIThinking && conversation[conversation.length - 1]?.speaker !== 'AIva' && (
                              <ChatMessage id="thinking" role="AIva" content="" isLoading={true} />
                           )}
                      </div>
                  </ScrollArea>
              </CardContent>
          </Card>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <div className="bg-red-500 rounded-full px-3 py-1 text-[10px] font-bold text-white flex items-center gap-1.5 animate-pulse shadow-lg shadow-red-500/30">
          <Sparkles className="w-3 h-3" />
          SYNC ACTIVE
        </div>
        <Button onClick={handleSwitchCamera} size="icon" variant="ghost" className="text-white bg-white/10 hover:bg-white/20 rounded-full" disabled={videoDevices.length < 2}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
          <div className="flex items-center gap-5">
            <Button onClick={toggleCamera} size="icon" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-full h-14 w-14 border border-white/10 shadow-lg transition-all active:scale-90">
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            
            <Button 
                onClick={handleDescribeScene} 
                size="icon" 
                variant="secondary" 
                className="bg-white/10 hover:bg-white/20 text-white rounded-full h-14 w-14 border border-white/10 shadow-lg transition-all active:scale-90"
                disabled={isAIThinking || isListening}
            >
              <Eye className="w-5 h-5" />
            </Button>
            
            <Button 
                onClick={handleTalkClick}
                size="icon" 
                className={cn("rounded-full h-20 w-20 transition-all border-4 shadow-2xl",
                    isListening ? "bg-red-500 border-red-400 scale-110" : "bg-white/10 border-white/20 hover:bg-white/20",
                    isAIThinking && "animate-pulse"
                )}
                disabled={isAIThinking || !hasPermissions}
            >
                <Mic className={cn("w-8 h-8", isListening ? "text-white" : "text-white/60")} />
            </Button>

            <Button 
                onClick={handleEndChat}
                size="icon" 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700 text-white rounded-full h-14 w-14 shadow-lg transition-all active:scale-90"
                disabled={isAIThinking || isListening || conversation.length === 0}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}