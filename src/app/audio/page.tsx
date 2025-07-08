'use client';

import {useState, useEffect, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Bot, User, Mic, Send, Loader} from 'lucide-react';
import {cn} from '@/lib/utils';
import Image from 'next/image';
import {chat} from '@/ai/flows/chat';
import {tts} from '@/ai/flows/tts';
import ChatMessage from '@/components/chat-message';

type Message = {
  role: 'You' | 'AI';
  content: string;
};

export default function AudioVisualChatPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {toast} = useToast();

  useEffect(() => {
    async function getCameraPermission() {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video: true});
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description:
              'Please enable camera permissions in your browser settings.',
          });
        }
      } else {
        setHasCameraPermission(false);
      }
    }
    getCameraPermission();
  }, [toast]);

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
        scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    const userMessage = input;
    setInput('');
    setIsSending(true);
    setAudioSrc(null);

    setMessages(prev => [...prev, {role: 'You', content: userMessage}]);

    try {
      const {response} = await chat({prompt: userMessage});
      setMessages(prev => [...prev, {role: 'AI', content: response}]);

      setIsGeneratingAudio(true);
      const {media} = await tts({text: response});
      setAudioSrc(media);
    } catch (error) {
      console.error(error);
      const errorMessage =
        'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, {role: 'AI', content: errorMessage}]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
    } finally {
      setIsSending(false);
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 flex items-center">
        <h1 className="text-xl font-semibold">Audio/Visual Chat</h1>
      </header>
      <main className="flex-1 overflow-hidden p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-2 h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-md"
              autoPlay
              muted
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 h-full">
            <Image
              src="https://placehold.co/1280x720.png"
              alt="Aiva's Avatar"
              width={1280}
              height={720}
              data-ai-hint="robot avatar"
              className="w-full h-full object-cover rounded-md"
            />
          </CardContent>
        </Card>
      </main>
      <div className="flex-1 flex flex-col overflow-hidden px-4">
        <ScrollArea className="flex-grow" ref={scrollAreaRef}>
          <div className="py-4 space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {isSending && messages[messages.length - 1]?.role === 'You' && (
              <ChatMessage role="AI" content="" isLoading={true} />
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="p-4 bg-background">
        {hasCameraPermission === false && (
          <Alert variant="destructive" className="mb-4 max-w-3xl mx-auto">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access to use this feature.
            </AlertDescription>
          </Alert>
        )}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl p-2 sm:p-3 shadow-sm border border-input flex items-center">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message Aiva..."
              className="bg-transparent border-0 focus-visible:ring-0 resize-none w-full p-2 text-base min-h-0"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isSending || hasCameraPermission === false}
              rows={1}
            />
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              onClick={sendMessage}
              disabled={isSending || !input.trim() || hasCameraPermission === false}
              size="icon"
              className="rounded-full w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted"
            >
              {isSending ? (
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
