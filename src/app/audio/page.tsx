
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sparkles,
  RefreshCw,
  Video,
  Upload,
  Pause,
  X,
  VideoOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LiveVideoPage() {
  const [hasPermissions, setHasPermissions] = useState<boolean | undefined>(undefined);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function getMediaPermissions() {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          streamRef.current = stream;
          setHasPermissions(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
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
    getMediaPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };
  
  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    router.push('/');
  };

  return (
    <div className="relative h-full w-full bg-black text-white">
      <video
        ref={videoRef}
        className={cn(
          "h-full w-full object-cover",
          !isCameraOn && "hidden"
        )}
        autoPlay
        muted
      />
      {!isCameraOn && (
         <div className="h-full w-full flex items-center justify-center bg-zinc-900">
            <div className="text-center text-muted-foreground">
                <VideoOff size={64} className="mx-auto mb-4" />
                <p>Camera is off</p>
            </div>
        </div>
      )}

      {hasPermissions === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
            <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Camera & Mic Access Required</AlertTitle>
                <AlertDescription>
                Please allow camera and microphone access to use this feature. You may need to refresh the page after granting permissions.
                </AlertDescription>
            </Alert>
        </div>
      )}

      {hasPermissions && (
        <>
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5">
                    <Sparkles className="h-5 w-5 text-red-500 fill-red-500" />
                    <span className="font-semibold text-sm">Live</span>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20 hover:text-white bg-black/30">
                    <RefreshCw className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-4">
                     <Button 
                        onClick={toggleCamera} 
                        size="icon" 
                        className={cn("h-16 w-16 rounded-full",
                            isCameraOn ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/25 text-white hover:bg-white/35'
                        )}
                    >
                        <Video className="h-7 w-7" />
                    </Button>
                    <Button 
                        size="icon" 
                        className="h-16 w-16 rounded-full bg-white/25 text-white hover:bg-white/35"
                    >
                        <Upload className="h-7 w-7" />
                    </Button>
                    <Button 
                        size="icon" 
                        className="h-16 w-16 rounded-full bg-white/25 text-white hover:bg-white/35"
                    >
                        <Pause className="h-7 w-7" />
                    </Button>
                    <Button 
                        onClick={handleEndCall} 
                        variant="destructive" 
                        size="icon" 
                        className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        <X className="h-7 w-7" />
                    </Button>
                </div>
            </div>
        </>
      )}
    </div>
  );
}
