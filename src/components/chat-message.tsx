import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, BadgeCheck, BrainCircuit, Volume2, Loader2, Film, AlarmClock, Calendar as CalendarIcon, Mail, Clock, ChevronRight, Plus, Star, Globe, Navigation, Cloud, Thermometer, Droplets, Wind, Sparkles, Music } from "lucide-react";
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
import placeholderData from "@/app/lib/placeholder-images.json";

type ChatMessageProps = {
  id: string;
  role: "You" | "AIva";
  content: string;
  isLoading?: boolean;
  imageUrl?: string;
  altText?: string;
  dataAiHint?: string;
  review?: SelfReviewOutput;
  toolData?: {
    type: 'alarm' | 'calendar' | 'email' | 'hospital' | 'weather';
    data: any;
  };
  onPlayAudio?: (messageId: string, text: string) => void;
  isSpeaking?: boolean;
};

const ReviewPopover = ({ review }: { review: SelfReviewOutput }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Badge variant="outline" className="cursor-pointer ml-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 shadow-sm transition-all rounded-lg h-6">
        <BadgeCheck className="h-3 w-3 mr-1" />
        <span className="text-[10px] uppercase tracking-wider font-bold">Verified</span>
      </Badge>
    </PopoverTrigger>
    <PopoverContent className="w-80 p-0 overflow-hidden border-white/10 bg-[#161618]/95 backdrop-blur-2xl shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h4 className="font-bold leading-none flex items-center text-sm text-primary">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Self-Analysis
          </h4>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-2 opacity-50">
            Quality Control Report
          </p>
      </div>
      <div className="p-4 space-y-3 text-xs leading-relaxed text-white/80">
           <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
              <span className="text-white/40">Evaluation</span>
              <span className="font-bold text-primary uppercase">{review.summaryEvaluation}</span>
           </div>
           {review.issuesFound && <div className="space-y-1"><p className="text-white/40 uppercase text-[9px] font-bold">Issues Found</p><p className="bg-red-500/5 p-2 rounded-xl border border-red-500/10">{review.issuesFound}</p></div>}
           {review.suggestedFixes && <div className="space-y-1"><p className="text-white/40 uppercase text-[9px] font-bold">Fix Suggestions</p><p className="bg-green-500/5 p-2 rounded-xl border border-red-500/10">{review.suggestedFixes}</p></div>}
           <div className="flex justify-between items-center border-t border-white/5 pt-3">
              <span className="text-white/40">Final Verdict</span>
              <span className="font-bold uppercase text-primary">{review.finalVerdict}</span>
           </div>
      </div>
    </PopoverContent>
  </Popover>
);

const AlarmCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[300px] animate-in slide-in-from-left-4 duration-500">
    <Card className="mt-3 overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      <div className="relative aspect-[4/3] w-full bg-primary/5 flex items-center justify-center p-8">
        <Image 
          src={placeholderData.alarm.imageUrl}
          alt="Alarm Illustration"
          fill
          className="object-contain p-6 drop-shadow-2xl"
          data-ai-hint="alarm clock"
        />
      </div>
      <div className="relative bg-[#1A1A1C] p-7 space-y-6 border-t border-white/5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">{data.alarmDetails?.label || 'General Reminder'}</p>
            <p className="text-4xl font-bold tracking-tighter text-white">{data.alarmDetails?.time}</p>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-primary scale-125" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-white/30" />
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Repeats: <span className="text-white/60">One Time</span></p>
          </div>
          <button className="text-[10px] font-bold text-white/80 hover:text-white transition-colors uppercase tracking-widest">Edit</button>
        </div>
      </div>
    </Card>
    <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] border border-white/10 font-bold text-sm shadow-xl transition-all">
      Set Another Reminder
    </Button>
  </div>
);

const CalendarCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[340px] animate-in slide-in-from-left-4 duration-500">
    <Card className="mt-3 overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      <div className="relative h-32 w-full flex flex-col items-center justify-center bg-primary/5">
        <Image 
          src={placeholderData.calendar.imageUrl}
          alt="Calendar Illustration"
          fill
          className="object-cover opacity-20"
          data-ai-hint="calendar office"
        />
        <div className="relative flex flex-col items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
                <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-lg font-bold">Schedule Update</CardTitle>
        </div>
      </div>
      <div className="relative bg-[#1A1A1C] p-5 space-y-3 border-t border-white/5">
        {data.events?.map((event: any, i: number) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] hover:border-primary/30 transition-all cursor-pointer">
            <div className="text-center w-14 shrink-0 border-r border-white/5 pr-4">
              <p className="text-[9px] uppercase font-bold text-primary tracking-widest mb-1">{event.date}</p>
              <p className="text-sm font-bold text-white">{event.time.split(' ')[0]}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white/90 truncate group-hover:text-white">{event.title}</p>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{event.time}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
          </div>
        ))}
      </div>
    </Card>
    <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] border border-white/10 font-bold text-sm shadow-xl transition-all">
      <Plus className="h-4 w-4 mr-2" />
      Create New Event
    </Button>
  </div>
);

const EmailCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-[340px] animate-in slide-in-from-left-4 duration-500">
    <div className="p-7 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
                <Mail className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-lg font-bold">Inbox Overview</CardTitle>
        </div>
        <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-lg font-bold px-3 py-1 h-7">{data.emails?.length || 0} New</Badge>
      </div>
      <p className="relative text-sm text-white/60 leading-relaxed font-medium mb-2">
        {data.summary || "You have some important messages needing attention."}
      </p>
    </div>
    <div className="bg-[#1A1A1C] p-4 space-y-2.5 border-t border-white/5">
      {data.emails?.map((email: any, i: number) => (
        <div key={i} className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-primary/30 transition-all cursor-pointer group">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{email.sender}</p>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Recently</p>
          </div>
          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{email.subject}</p>
          <p className="text-xs text-white/40 line-clamp-2 mt-1.5 leading-relaxed">{email.snippet}</p>
        </div>
      ))}
      <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 h-12 rounded-2xl">
        See All Messages
      </Button>
    </div>
  </Card>
);

const HospitalCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[360px] animate-in slide-in-from-left-4 duration-500">
    {data.recommendations?.map((hosp: any, i: number) => (
      <Card key={i} className="overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
        <div className="p-6 relative space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative h-16 w-16 rounded-[1.25rem] overflow-hidden border-2 border-white/10 shadow-lg">
              <Image 
                src={hosp.imageUrl}
                alt={hosp.name}
                fill
                className="object-cover"
                data-ai-hint="hospital building"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-white leading-tight truncate">{hosp.name}</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{hosp.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-500">{hosp.rating}</span>
            </div>
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{hosp.reviews}</span>
          </div>
        </div>
        <div className="flex border-t border-white/5 relative bg-white/[0.02]">
          <button className="flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 transition-all border-r border-white/5">
            <Globe className="h-4 w-4" />
            Portal
          </button>
          <button className="flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Navigation className="h-4 w-4" />
            Locate
          </button>
        </div>
      </Card>
    ))}
    <Button className="w-full h-14 bg-primary text-white rounded-[2rem] font-bold text-sm shadow-[0_0_30px_rgba(217,119,87,0.3)] transition-all active:scale-95">
      Find More Options
    </Button>
  </div>
);

const WeatherCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-[320px] animate-in slide-in-from-left-4 duration-500">
    <div className="relative aspect-[4/3] w-full bg-primary/5 flex items-center justify-center group">
       <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
       <Image 
          src={placeholderData.weather.imageUrl}
          alt="Weather Illustration"
          fill
          className="object-contain p-8 drop-shadow-2xl transition-transform group-hover:scale-110 duration-700"
          data-ai-hint="cloudy weather"
        />
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-white/10 backdrop-blur-2xl rounded-2xl px-4 py-2 border border-white/20 shadow-xl">
          <Cloud className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{data.location}</span>
        </div>
    </div>
    <div className="bg-[#1A1A1C] p-8 text-white relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-start">
            <p className="text-6xl font-bold tracking-tighter text-white">{data.temperature}</p>
            <span className="text-2xl font-bold text-primary mt-1">°</span>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-white/40 mt-2">{data.condition}</p>
        </div>
        <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-xl px-4 py-1.5 font-bold h-9">CELSIUS</Badge>
      </div>
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] uppercase font-bold tracking-widest text-white/30">Humidity</p>
            <p className="text-sm font-bold text-white">{data.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <Wind className="h-4 w-4 text-green-400" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] uppercase font-bold tracking-widest text-white/30">Wind</p>
            <p className="text-sm font-bold text-white">{data.windSpeed}km/h</p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export default function ChatMessage({ id, role, content, isLoading, imageUrl, altText, dataAiHint, review, toolData, onPlayAudio, isSpeaking }: ChatMessageProps) {
  const isAi = role === "AIva";
  const isVideo = imageUrl?.startsWith('data:video/mp4');
  const isAudio = imageUrl?.startsWith('data:audio/wav');
  const isImageGen = imageUrl && !isVideo && !isAudio && content?.toLowerCase().includes('image');

  return (
    <div className={cn(
        "flex items-start gap-5 group animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full overflow-hidden",
        isAi ? "flex-row" : "flex-row-reverse"
    )}>
      <Avatar className={cn(
          "h-12 w-12 rounded-2xl border transition-all duration-300 shadow-xl shrink-0",
          isAi ? "border-white/10 bg-white/[0.03]" : "border-primary/40 bg-primary/20"
      )}>
          <AvatarFallback className="bg-transparent text-white">
              {isAi ? <Bot className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-white" />}
          </AvatarFallback>
      </Avatar>
      
      <div className={cn(
          "flex-1 pt-1 space-y-3",
          isAi ? "items-start" : "items-end flex flex-col"
      )}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            {isAi ? "AIva Intelligence" : "User Terminal"}
          </span>
          {isAi && review && <ReviewPopover review={review} />}
          {isVideo && <Badge variant="secondary" className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg h-6 px-2.5 text-[9px] uppercase font-bold tracking-widest"><Film className="w-3 h-3 mr-1.5" /> Veo 3.0</Badge>}
          {isAudio && <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-lg h-6 px-2.5 text-[9px] uppercase font-bold tracking-widest"><Music className="w-3 h-3 mr-1.5" /> AI Studio</Badge>}
          {isImageGen && <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 rounded-lg h-6 px-2.5 text-[9px] uppercase font-bold tracking-widest"><Sparkles className="w-3 h-3 mr-1.5" /> Gemini 2.0</Badge>}
        </div>

        <div className={cn(
            "relative max-w-full md:max-w-2xl px-6 py-4 rounded-[2rem] transition-all duration-300 shadow-2xl",
            isAi 
                ? "bg-[#161618] border border-white/10 rounded-tl-none text-white/95" 
                : "bg-primary border border-primary shadow-[0_10px_30px_rgba(217,119,87,0.2)] rounded-tr-none text-white font-semibold"
        )}>
          {isLoading ? (
            <div className="flex items-center space-x-2 py-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/30 animate-bounce" />
            </div>
          ) : (
            <div className="space-y-4">
              {content && (
                <p className={cn(
                  "whitespace-pre-wrap text-sm md:text-[15px] leading-relaxed font-medium",
                  isAi ? "text-white/95" : "text-white"
                )}>
                  {content}
                </p>
              )}
              
              {toolData && (
                <div className="pt-2">
                  {toolData.type === 'alarm' && <AlarmCard data={toolData.data} />}
                  {toolData.type === 'calendar' && <CalendarCard data={toolData.data} />}
                  {toolData.type === 'email' && <EmailCard data={toolData.data} />}
                  {toolData.type === 'hospital' && <HospitalCard data={toolData.data} />}
                  {toolData.type === 'weather' && <WeatherCard data={toolData.data} />}
                </div>
              )}

              {imageUrl && (
                <div className="mt-4 relative group/media overflow-hidden rounded-[2rem] border-2 border-white/5 shadow-2xl">
                  {isVideo ? (
                    <video 
                      src={imageUrl} 
                      controls 
                      className="w-full h-auto aspect-video bg-black/40"
                    />
                  ) : isAudio ? (
                    <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] flex flex-col gap-6 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/40">
                                <Music className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white block uppercase tracking-wider">AI Mastered Audio</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Procedural Generation</span>
                            </div>
                        </div>
                        <audio controls className="w-full h-10 opacity-80 filter invert grayscale brightness-200">
                            <source src={imageUrl} />
                        </audio>
                    </div>
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={altText || "AI generated media"}
                      width={800}
                      height={500}
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover/media:scale-105"
                      data-ai-hint={dataAiHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity" />
                </div>
              )}
               
               {isAi && content && onPlayAudio && (
                <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-white/40 hover:text-primary hover:bg-primary/10 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-xl", 
                        isSpeaking && "text-primary border-primary/40 bg-primary/10 shadow-primary/20 animate-pulse"
                    )}
                    onClick={() => onPlayAudio(id, content)}
                  >
                    {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
