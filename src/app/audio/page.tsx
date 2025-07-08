
'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Bot, User, Mic, Send, Loader} from 'lucide-react';
import {cn} from '@/lib/utils';
import {tts} from '@/ai/flows/tts';
import ChatMessage from '@/components/chat-message';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { geminiSwitchChat } from '@/ai/flows/gemini-switch-chat';
import ModeIndicator from '@/components/mode-indicator';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  role: 'You' | 'AI';
  content: string;
};

export default function AudioVisualChatPage() {
  const [hasPermissions, setHasPermissions] = useState<boolean | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const {toast} = useToast();
  const isOnline = useOnlineStatus();

  const playIntro = useCallback(() => {
     setMessages([{role: 'AI', content: "Hello! I'm Aiva. How can I assist you today?"}]);
  }, []);

  const sendMessage = useCallback(
    async (messageToSend: string) => {
      if (!messageToSend.trim() || isProcessing) return;

      const userMessage = messageToSend;
      setInput('');
      setIsProcessing(true);
      setAudioSrc(null);

      setMessages(prev => [...prev, {role: 'You', content: userMessage}]);

      try {
        const {response} = await geminiSwitchChat({prompt: userMessage, isOnline});
        setMessages(prev => [...prev, {role: 'AI', content: response}]);

        if (isOnline) {
          const {media} = await tts({text: response});
          setAudioSrc(media);
        }
      } catch (error) {
        console.error(error);
        const errorMessage = 'Sorry, I encountered an error. Please try again.';
        setMessages(prev => [...prev, {role: 'AI', content: errorMessage}]);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get a response from the AI.',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [toast, isOnline, isProcessing]
  );

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
          sendMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          let description = 'Could not process audio.';
          if (event.error === 'not-allowed') {
            description = 'Microphone access was denied. Please enable it in your browser settings to use voice input.';
          } else {
            description = `An error occurred: ${event.error}`;
          }
          toast({
            variant: 'destructive',
            title: 'Speech Recognition Error',
            description: description,
          });
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, [toast, sendMessage]);
  
  useEffect(() => {
    async function getMediaPermissions() {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setHasPermissions(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          playIntro();
        } catch (error) {
          console.error('Error accessing media devices:', error);
          setHasPermissions(false);
          toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description:
              'Please enable camera and microphone permissions in your browser settings.',
          });
        }
      } else {
        setHasPermissions(false);
      }
    }
    getMediaPermissions();
  }, [toast, playIntro]);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error('Audio playback failed', e);
        toast({
          variant: 'destructive',
          title: 'Audio Playback Error',
          description: 'Could not play the generated audio.',
        });
      });
    }
  }, [audioSrc, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport =
        scrollAreaRef.current.querySelector(
          'div[data-radix-scroll-area-viewport]'
        );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

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
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
  
  const isDisabled = isProcessing || hasPermissions === false || isRecording;

  return (
    <div className="flex flex-col h-full bg-background/80">
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audio/Visual Chat</h1>
        <ModeIndicator />
      </header>
      <main className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        <div className="w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg border border-border">
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black"
              autoPlay
              muted
            />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden mt-4">
          <ScrollArea className="flex-grow" ref={scrollAreaRef}>
            <div className="py-4 space-y-6 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isProcessing && messages[messages.length - 1]?.role === 'You' && (
                <ChatMessage role="AI" content="" isLoading={true} />
              )}
            </div>
          </ScrollArea>
        </div>
      </main>

      <footer className="p-4 bg-background">
        {hasPermissions === false && (
          <Alert variant="destructive" className="mb-4 max-w-3xl mx-auto">
            <AlertTitle>Camera & Mic Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera and microphone access to use this feature.
            </AlertDescription>
          </Alert>
        )}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-full p-2 sm:p-3 shadow-sm border border-input flex items-center">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isRecording ? 'Listening...' : 'Message Aiva...'}
              className="bg-transparent border-0 focus-visible:ring-0 resize-none w-full p-2 text-base min-h-0"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={isDisabled}
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-full text-muted-foreground', {
                'bg-destructive/20 text-destructive animate-pulse': isRecording,
              })}
              onClick={handleMicClick}
              disabled={isProcessing || hasPermissions === false}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => sendMessage(input)}
              disabled={isDisabled || !input.trim()}
              size="icon"
              className="rounded-full w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
            >
              {isProcessing ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </footer>
      <audio ref={audioRef} src={audioSrc || undefined} className="hidden" />
    </div>
  );
}
