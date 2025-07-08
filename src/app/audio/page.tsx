'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Bot, User, Loader2, RotateCcw } from 'lucide-react';
import { geminiSwitchChat } from '@/ai/flows/gemini-switch-chat';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { tts } from '@/ai/flows/tts';
import { summarize } from '@/ai/flows/summarize';

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

export default function VoiceChatPage() {
  const [hasPermissions, setHasPermissions] = useState<boolean | undefined>(undefined);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  // 1. Permissions and Initial Greeting
  useEffect(() => {
    async function setupPage() {
      // Get media permissions
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          setHasPermissions(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          // Greet user
          speak("Hello. I'm Aiva. What would you like to talk about today?");

        } catch (error) {
          console.error('Error accessing media devices:', error);
          setHasPermissions(false);
          toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description: 'Please enable camera and microphone permissions in your browser settings.',
          });
        }
      } else {
        setHasPermissions(false);
      }
    }
    setupPage();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [toast]);

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
            setConversation((prev) => [...prev, { speaker: 'AIva', text: aiResponse.response }]);
            speak(aiResponse.response);
          } catch (error) {
            console.error(error);
            const errorMsg = "Sorry, I ran into an error. Please try again.";
            setConversation((prev) => [...prev, { speaker: 'AIva', text: errorMsg }]);
            speak(errorMsg);
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
  }, [isOnline, toast]);
  
  // 3. Helper Functions
  const speak = async (text: string) => {
    if (!text) return;
    try {
      const { media } = await tts({ text });
      if (audioRef.current) {
        audioRef.current.src = media;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      toast({ variant: "destructive", title: "Could not play audio" });
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
    setIsAIThinking(true);
    setChatEnded(true);
    const fullConversation = conversation.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
    try {
      const { summary } = await summarize({ conversation: fullConversation });
      const summaryText = `Here is a summary of our conversation: ${summary}`;
      setConversation((prev) => [...prev, { speaker: 'AIva', text: summaryText }]);
      speak(summaryText);
    } catch (error) {
      console.error("Summarization Error:", error);
      const errorMsg = "Sorry, I couldn't summarize the conversation.";
      setConversation((prev) => [...prev, { speaker: 'AIva', text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsAIThinking(false);
    }
  };
  
  const handleStartOver = () => {
    setConversation([]);
    setChatEnded(false);
    speak("Hello. What would you like to talk about today?");
  }

  // Auto-scroll chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [conversation]);


  // 4. Render component
  if (hasPermissions === undefined) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (hasPermissions === false) {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Camera & Mic Access Required</AlertTitle>
                <AlertDescription>
                Please allow camera and microphone access to use this feature. You may need to refresh the page after granting permissions.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-4 p-4 bg-muted/40">
      {/* Left side: Video + Controls */}
      <div className="flex flex-col gap-4 md:w-1/2 lg:w-2/3">
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
        </div>
        <div className="flex gap-4">
          {!chatEnded ? (
            <>
              <Button onClick={handleTalkClick} size="lg" className="flex-1" disabled={isAIThinking || isListening}>
                <Mic className={`mr-2 h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
                {isListening ? 'Listening...' : 'Talk to AIva'}
              </Button>
              <Button onClick={handleEndChat} size="lg" variant="destructive" disabled={isAIThinking || isListening || conversation.length === 0}>
                End Chat & Summarize
              </Button>
            </>
          ) : (
             <Button onClick={handleStartOver} size="lg" className="flex-1">
                <RotateCcw className="mr-2 h-5 w-5" />
                Start New Chat
             </Button>
          )}
        </div>
      </div>
      
      {/* Right side: Conversation */}
      <Card className="flex flex-col md:w-1/2 lg:w-1/3">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 -mx-6" ref={scrollAreaRef}>
             <div className="px-6 space-y-4">
                {conversation.map((msg, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0">
                          {msg.speaker === 'AIva' ? <Bot className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-muted-foreground" />}
                        </span>
                        <p className="pt-0.5 text-sm">{msg.text}</p>
                    </div>
                ))}
                {isAIThinking && (
                   <div className="flex items-start gap-3">
                       <span className="flex-shrink-0">
                         <Bot className="h-6 w-6 text-primary" />
                       </span>
                       <div className="flex items-center space-x-1 p-1 pt-2">
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                        </div>
                   </div>
                )}
             </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
