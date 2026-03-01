import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, BadgeCheck, BrainCircuit, Volume2, Loader2, Film, AlarmClock, Calendar as CalendarIcon, Mail, Clock } from "lucide-react";
import Image from "next/image";
import type { SelfReviewOutput } from "@/ai/flows/self-review";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";


type ChatMessageProps = {
  id: string;
  role: "You" | "AI";
  content: string;
  isLoading?: boolean;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
  review?: SelfReviewOutput;
  toolData?: {
    type: 'alarm' | 'calendar' | 'email';
    data: any;
  };
  onPlayAudio?: (messageId: string, text: string) => void;
  isSpeaking?: boolean;
};

const ReviewPopover = ({ review }: { review: SelfReviewOutput }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Badge variant="outline" className="cursor-pointer ml-2 border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/20 shadow-sm transition-all">
        <BadgeCheck className="h-3 w-3 mr-1" />
        Reviewed
      </Badge>
    </PopoverTrigger>
    <PopoverContent className="w-80 text-sm">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2 text-primary" />
            AI Self-Review
          </h4>
          <p className="text-xs text-muted-foreground">
            Aiva reviews its own responses for quality and accuracy.
          </p>
        </div>
        <div className="space-y-2 bg-muted/40 p-3 rounded-lg text-xs leading-relaxed">
           <p><span className="font-semibold text-primary">Evaluation:</span> {review.summaryEvaluation}</p>
           {review.issuesFound && <p><span className="font-semibold text-primary">Issues:</span> {review.issuesFound}</p>}
           {review.suggestedFixes && <p><span className="font-semibold text-primary">Fixes:</span> {review.suggestedFixes}</p>}
           <p><span className="font-semibold text-primary">Verdict:</span> {review.finalVerdict}</p>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

const AlarmCard = ({ data }: { data: any }) => (
  <Card className="mt-3 border-orange-500/20 bg-orange-500/5 overflow-hidden">
    <CardHeader className="p-4 pb-2">
      <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-600">
        <AlarmClock className="h-4 w-4" />
        Alarm Set
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tighter text-orange-700">{data.alarmDetails?.time}</p>
          <p className="text-xs text-orange-600/70 font-medium uppercase tracking-wider">{data.alarmDetails?.label || 'General Reminder'}</p>
        </div>
        <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center">
          <Clock className="h-5 w-5 text-orange-600 animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CalendarCard = ({ data }: { data: any }) => (
  <Card className="mt-3 border-blue-500/20 bg-blue-500/5">
    <CardHeader className="p-4 pb-2">
      <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
        <CalendarIcon className="h-4 w-4" />
        Calendar Events
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-3">
      {data.events?.map((event: any, i: number) => (
        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/50 border border-blue-500/10">
          <div className="text-center w-10 shrink-0">
            <p className="text-[10px] uppercase font-bold text-blue-500/70">{event.date}</p>
            <p className="text-xs font-bold text-blue-600">{event.time.split(' ')[0]}</p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground/80">{event.title}</p>
            <p className="text-[10px] text-muted-foreground">{event.time}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const EmailCard = ({ data }: { data: any }) => (
  <Card className="mt-3 border-purple-500/20 bg-purple-500/5">
    <CardHeader className="p-4 pb-2">
      <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-600">
        <Mail className="h-4 w-4" />
        Email Summary
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0 space-y-2">
      {data.emails?.map((email: any, i: number) => (
        <div key={i} className="p-2 rounded-lg bg-white/50 border border-purple-500/10 hover:bg-white/80 transition-colors">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-purple-700">{email.sender}</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </div>
          <p className="text-xs font-semibold line-clamp-1">{email.subject}</p>
          <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{email.snippet}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);


export default function ChatMessage({ id, role, content, isLoading, imageUrl, altText, dataAiHint, review, toolData, onPlayAudio, isSpeaking }: ChatMessageProps) {
  const isAi = role === "AI";
  const isVideo = imageUrl?.startsWith('data:video/mp4');

  return (
    <div className="flex items-start gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Avatar className="h-9 w-9 border border-border shadow-sm">
          <AvatarFallback className={cn(isAi ? "bg-card text-foreground" : "bg-primary text-primary-foreground shadow-inner")}>
              {isAi ? <Bot size={20} /> : <User size={20}/>}
          </AvatarFallback>
      </Avatar>
      <div className="flex-1 pt-0.5 space-y-2">
        <div className="font-semibold flex items-center text-sm md:text-base">
          {isAi ? "Aiva" : "You"}
          {isAi && review && <ReviewPopover review={review} />}
        </div>
        <div className="text-foreground/90 relative pr-10">
          {isLoading ? (
            <div className="flex items-center space-x-1.5 p-2 bg-muted/30 rounded-full w-fit">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
            </div>
          ) : (
            <>
              {content && <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{content}</p>}
              
              {toolData && (
                <div className="max-w-md">
                  {toolData.type === 'alarm' && <AlarmCard data={toolData.data} />}
                  {toolData.type === 'calendar' && <CalendarCard data={toolData.data} />}
                  {toolData.type === 'email' && <EmailCard data={toolData.data} />}
                </div>
              )}

              {imageUrl && (
                <div className="mt-3 relative group/media overflow-hidden rounded-xl border border-border shadow-md">
                  {isVideo ? (
                    <video 
                      src={imageUrl} 
                      controls 
                      className="w-full h-auto aspect-video bg-black"
                    />
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={altText || "AI generated media"}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover/media:scale-105"
                      data-ai-hint={dataAiHint}
                    />
                  )}
                  {isVideo && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 text-white shadow-lg">
                      <Film className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )}
               {isAi && content && onPlayAudio && (
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full", isSpeaking && "text-primary animate-pulse")}
                    onClick={() => onPlayAudio(id, content)}
                  >
                    {isSpeaking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
