
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sparkles,
  RefreshCw,
  Video,
  Upload,
  X,
  VideoOff,
  Mic,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiSwitchChat } from '@/ai/flows/gemini-switch-chat';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { tts } from '@/ai/flows/tts';
import { summarize } from '@/ai/flows/summarize';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type ConversationMessage = {
  speaker: 'You' | 'AIva';
  text: string;
};

export default function LiveVideoPage() {
  const [hasPermissions, setHasPermissions] = useState<boolean | undefined>(undefined);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();
  const isOnline = useOnlineStatus();

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
              resolve(); // Resolve even on error to not block the flow
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
  
  const initializeMedia = useCallback(async () => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          setHasPermissions(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          return stream;
        } catch (error) {
          console.error('Error accessing media devices:', error);
          setHasPermissions(false);
          toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description: 'Please enable camera and microphone permissions.',
          });
          return null;
        }
    }
    setHasPermissions(false);
    return null;
  }, [toast]);


  // 1. Permissions and Initial Greeting
  useEffect(() => {
    async function setupPage() {
      const stream = await initializeMedia();
      if (stream) {
        setIsAIThinking(true);
        await speak("Hello. I'm Aiva. Tap the microphone to talk.");
        setIsAIThinking(false);
      }
    }
    if (!chatEnded) {
        setupPage();
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
  }, [speak, toast, initializeMedia, chatEnded]);

  // 2. Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = async (event: any) => {
          const userSpeech = event.results[0][0].transcript;
          setConversation((prev) => [...prev, { speaker: 'You', text: userSpeech }]);
          setIsAIThinking(true);

          try {
            const aiResponse = await geminiSwitchChat({ prompt: userSpeech, isOnline, performResearch: false });
            if (aiResponse.response) {
              setConversation((prev) => [...prev, { speaker: 'AIva', text: aiResponse.response }]);
              await speak(aiResponse.response);
            } else {
              const errorMsg = "I'm not sure how to respond to that. Please try again.";
              setConversation((prev) => [...prev, { speaker: 'AIva', text: errorMsg }]);
              await speak(errorMsg);
            }
          } catch (error) {
            console.error(error);
            const errorMsg = "Sorry, I ran into an error. Please try again.";
            setConversation((prev) => [...prev, { speaker: 'AIva', text: errorMsg }]);
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
  }, [isOnline, speak, toast]);
  
  // 3. Helper Functions
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

  const handleEndChat = async () => {
    setChatEnded(true);
    setIsAIThinking(true);
    
    // Stop listening and camera
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }

    const fullConversation = conversation.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
    
    try {
      await speak("One moment while I summarize our conversation.");
      const result = await summarize({ conversation: fullConversation });
      setSummary(result.summary);
    } catch (error) {
      console.error("Summarization Error:", error);
      const errorMsg = "Sorry, I couldn't summarize the conversation.";
      setSummary(errorMsg);
      await speak(errorMsg);
    } finally {
      setIsAIThinking(false);
    }
  };
  
  const handleStartOver = useCallback(async () => {
    setConversation([]);
    setSummary(null);
    setIsListening(false);
    setIsAIThinking(false);
    // This will trigger the useEffect to re-initialize
    setChatEnded(false); 
  }, []);

  // 4. Render component
  if (hasPermissions === undefined) {
    return <div className="flex h-screen w-full items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }
  
  if (hasPermissions === false) {
    return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-black">
            <Alert variant="destructive" className="max-w-sm bg-gray-900 border-red-500/50 text-white">
                <AlertTitle>Camera & Mic Access Required</AlertTitle>
                <AlertDescription>
                Please allow camera and microphone access to use this feature. You may need to refresh the page after granting permissions.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (chatEnded) {
    return (
      <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-4">Conversation Ended</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Here's a summary of your chat with Aiva.
        </p>

        <Card className="w-full max-w-2xl bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle>Conversation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isAIThinking ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4 text-muted-foreground">Generating summary...</p>
              </div>
            ) : (
              <ScrollArea className="h-64 pr-4">
                <p className="whitespace-pre-wrap text-foreground/90">{summary}</p>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button onClick={handleStartOver} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-14 text-lg px-10">
              <RotateCcw className="mr-3 h-6 w-6" />
              Start New Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative flex items-center justify-center">
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
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
          <VideoOff className="h-24 w-24 mb-4" />
          <p className="text-xl">Camera is off</p>
        </div>
      )}

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 rounded-full px-3 py-1 text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Live
          </div>
        </div>
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-4">
            <Button onClick={toggleCamera} size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-14 w-14">
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            <Button size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-14 w-14">
              <Upload className="w-6 h-6" />
            </Button>
            
            <Button 
                onClick={handleTalkClick}
                size="icon" 
                variant="secondary" 
                className={cn("rounded-full h-20 w-20 transition-all",
                    isListening ? "bg-white/30 scale-110" : "bg-white/20 hover:bg-white/30",
                    isAIThinking && "animate-pulse"
                )}
                disabled={isAIThinking}
            >
                <Mic className="w-8 h-8 text-white" />
            </Button>

            <Button 
                onClick={handleEndChat}
                size="icon" 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700 text-white rounded-full h-14 w-14"
                disabled={isAIThinking || isListening || conversation.length === 0}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
