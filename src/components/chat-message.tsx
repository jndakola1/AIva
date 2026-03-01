import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, BadgeCheck, BrainCircuit, Volume2, Loader2, Film, AlarmClock, Calendar as CalendarIcon, Mail, Clock, ChevronRight, Plus, Star, Globe, Navigation } from "lucide-react";
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
import { Switch } from "./ui/switch";


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
    type: 'alarm' | 'calendar' | 'email' | 'hospital';
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
  <div className="space-y-4">
    <Card className="mt-3 overflow-hidden border-none bg-[#FDF0F3] rounded-3xl shadow-xl max-w-[280px]">
      <div className="relative aspect-[4/3] w-full bg-[#FFE8EC] flex items-center justify-center p-6">
        <Image 
          src={`https://picsum.photos/seed/${encodeURIComponent(data.alarmDetails?.label || 'alarm')}/400/300`}
          alt="Alarm Illustration"
          fill
          className="object-contain p-4"
          data-ai-hint="alarm clock"
        />
      </div>
      <div className="bg-[#3D2C2E] p-6 text-white space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">{data.alarmDetails?.label || 'General Reminder'}</p>
            <p className="text-3xl font-bold tracking-tight">{data.alarmDetails?.time}</p>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-[#FF4D6D]" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <p className="text-[10px] text-white/50">Occurs every: <span className="text-white">One Time</span></p>
          <button className="text-[10px] font-bold text-white underline underline-offset-4">Change</button>
        </div>
      </div>
    </Card>
    <Button variant="secondary" className="w-full max-w-[280px] bg-[#3D2C2E] hover:bg-[#4D3C3E] text-white rounded-2xl h-12 text-sm font-semibold">
      Make Another
    </Button>
  </div>
);

const CalendarCard = ({ data }: { data: any }) => (
  <div className="space-y-4">
    <Card className="mt-3 overflow-hidden border-none bg-[#F0F4FD] rounded-3xl shadow-xl max-w-[320px]">
      <div className="relative h-24 w-full bg-[#E8EEFF] flex items-center justify-center">
        <Image 
          src="https://picsum.photos/seed/calendar/400/100"
          alt="Calendar Illustration"
          fill
          className="object-cover opacity-80"
          data-ai-hint="calendar office"
        />
        <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px]" />
        <CardTitle className="relative text-blue-900 text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Today's Events
        </CardTitle>
      </div>
      <div className="bg-white p-4 space-y-3">
        {data.events?.map((event: any, i: number) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
            <div className="text-center w-12 shrink-0 border-r border-slate-200 pr-3">
              <p className="text-[10px] uppercase font-bold text-blue-500">{event.date}</p>
              <p className="text-sm font-bold text-slate-700">{event.time.split(' ')[0]}</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{event.title}</p>
              <p className="text-[10px] text-slate-500">{event.time}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
          </div>
        ))}
      </div>
    </Card>
    <Button variant="outline" className="w-full max-w-[320px] rounded-2xl h-12 text-sm font-semibold border-2 border-slate-100 hover:bg-slate-50">
      <Plus className="h-4 w-4 mr-2" />
      Add New Event
    </Button>
  </div>
);

const EmailCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-none bg-[#F7F0FD] rounded-3xl shadow-xl max-w-[320px]">
    <div className="p-5 bg-[#EFDBFF]">
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Inbox Review
        </CardTitle>
        <Badge className="bg-purple-600 hover:bg-purple-700">{data.emails?.length || 0} New</Badge>
      </div>
      <p className="text-xs text-purple-900/60 leading-relaxed font-medium">
        {data.summary || "You have some important messages needing attention."}
      </p>
    </div>
    <div className="bg-white p-3 space-y-2">
      {data.emails?.map((email: any, i: number) => (
        <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-100 transition-all cursor-pointer">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-bold text-purple-700">{email.sender}</p>
            <p className="text-[10px] text-slate-400 font-medium">Today</p>
          </div>
          <p className="text-sm font-bold text-slate-800 line-clamp-1">{email.subject}</p>
          <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 leading-relaxed">{email.snippet}</p>
        </div>
      ))}
    </div>
  </Card>
);

const HospitalCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[340px]">
    {data.recommendations?.map((hosp: any, i: number) => (
      <Card key={i} className="overflow-hidden border-none bg-[#3D2C2E] rounded-3xl shadow-xl text-white">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-white/10 shrink-0">
              <Image 
                src={hosp.imageUrl}
                alt={hosp.name}
                fill
                className="object-cover"
                data-ai-hint="hospital building"
              />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">{hosp.name}</p>
              <p className="text-xs text-white/60 font-medium">{hosp.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="ml-1 text-xs font-bold text-white">{hosp.rating}</span>
            </div>
            <span className="text-[10px] text-white/50 font-medium">{hosp.reviews}</span>
          </div>
        </div>
        <div className="flex border-t border-white/10">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold hover:bg-white/5 transition-colors border-r border-white/10">
            <Globe className="h-3 w-3" />
            Website
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold hover:bg-white/5 transition-colors">
            <Navigation className="h-3 w-3" />
            Direction
          </button>
        </div>
      </Card>
    ))}
    <Button variant="secondary" className="w-full rounded-full h-14 bg-white/10 hover:bg-white/20 text-white border-none shadow-lg text-sm font-bold">
      Open browser for more
    </Button>
  </div>
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
                <div className="max-w-md pt-2">
                  {toolData.type === 'alarm' && <AlarmCard data={toolData.data} />}
                  {toolData.type === 'calendar' && <CalendarCard data={toolData.data} />}
                  {toolData.type === 'email' && <EmailCard data={toolData.data} />}
                  {toolData.type === 'hospital' && <HospitalCard data={toolData.data} />}
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
