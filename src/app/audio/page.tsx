
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiSwitchChat } from '@/ai/flows/gemini-switch-chat';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { tts } from '@/ai/flows/tts';
import { summarize } from '@/ai/flows/summarize';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { describeImage } from '@/ai/flows/describe-image';


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
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);


  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  
  const handleStartOver = useCallback(async () => {
    setConversation([]);
    setSummary(null);
    setIsListening(false);
    setIsAIThinking(false);
    setChatEnded(false); 
    setHasPermissions(undefined); // This will trigger re-initialization
  }, []);

  const getMediaStream = useCallback(async (deviceId?: string) => {
    // Stop any existing stream
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


  // 1. Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasPermissions(false);
        return;
      }
      try {
        // Request just to get permission, stream is handled later
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Stop these tracks immediately, we'll get a fresh stream later
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

    // Cleanup on unmount
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

  // 2. Setup media stream and initial greeting once permissions are granted
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
            await speak("Hello. I'm Aiva. Tap the microphone to talk.");
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


  // 3. Speech Recognition Setup
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
          
          const currentConversation = [...conversation];

          setConversation((prev) => [...prev, { speaker: 'You', text: userSpeech }]);
          setIsAIThinking(true);

          try {
            const aiResponse = await geminiSwitchChat({ 
              prompt: userSpeech, 
              isOnline, 
              performResearch: false,
              history: currentConversation,
            });

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
  }, [isOnline, speak, toast, conversation, hasPermissions]);
  
  // 4. Helper Functions
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
    setConversation((prev) => [...prev, { speaker: 'You', text: '[ AIva, describe what you see ]' }]);

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
        setConversation((prev) => [...prev, { speaker: 'AIva', text: description }]);
        await speak(description);
      } catch (error) {
        console.error("Describe Scene Error:", error);
        const errorMsg = "Sorry, I had trouble analyzing the scene.";
        setConversation((prev) => [...prev, { speaker: 'AIva', text: errorMsg }]);
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

  // 5. Render component
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
            {isAIThinking && !summary ? (
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

      {/* Top Left Overlay: Conversation */}
      <div className="absolute top-0 left-0 p-4 h-2/5 w-full md:w-1/3">
          <Card className="h-full bg-black/50 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                  <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-16">
                  <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                          {conversation.map((msg, index) => (
                              <div key={index}>
                                  <p className="font-bold text-sm">{msg.speaker}</p>
                                  <p className="text-sm text-white/90">{msg.text}</p>
                              </div>
                          ))}
                           {isAIThinking && conversation[conversation.length - 1]?.speaker !== 'AIva' && (
                              <div>
                                <p className="font-bold text-sm">AIva</p>
                                <div className="flex items-center space-x-1 p-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                                </div>
                              </div>
                           )}
                      </div>
                  </ScrollArea>
              </CardContent>
          </Card>
      </div>


      {/* Top Right Overlay: Controls */}
      <div className="absolute top-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 rounded-full px-3 py-1 text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Live
          </div>
        </div>
        <Button onClick={handleSwitchCamera} size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full" title="Switch Camera" disabled={videoDevices.length < 2}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-4">
            <Button onClick={toggleCamera} size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-14 w-14">
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            <Button 
                onClick={handleDescribeScene} 
                size="icon" 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white rounded-full h-14 w-14"
                disabled={isAIThinking || isListening}
                title="Describe Scene"
            >
              <Eye className="w-6 h-6" />
            </Button>
            
            <Button 
                onClick={handleTalkClick}
                size="icon" 
                variant="secondary" 
                className={cn("rounded-full h-20 w-20 transition-all",
                    isListening ? "bg-white/30 scale-110" : "bg-white/20 hover:bg-white/30",
                    isAIThinking && "animate-pulse"
                )}
                disabled={isAIThinking || !hasPermissions}
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
      
      <canvas ref={canvasRef} className="hidden" />
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
