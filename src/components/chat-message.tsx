import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, BadgeCheck, BrainCircuit, Volume2, Loader2, Film, AlarmClock, Calendar as CalendarIcon, Mail, Clock, ChevronRight, Plus, Star, Globe, Navigation, Cloud, Thermometer, Droplets, Wind, Sparkles, Music, Telescope, FileText, LayoutDashboard, Zap, Play, Activity, ListTodo, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { Checkbox } from "./ui/checkbox";
import placeholderData from "@/app/lib/placeholder-images.json";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip as RechartsTooltip } from 'recharts';

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
    type: 'alarm' | 'calendar' | 'email' | 'hospital' | 'weather' | 'research' | 'briefing' | 'task';
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
    <PopoverContent className="w-80 p-0 overflow-hidden border-foreground/10 bg-background/95 backdrop-blur-2xl shadow-2xl">
      <div className="p-4 border-b border-foreground/5 bg-foreground/[0.02]">
          <h4 className="font-bold leading-none flex items-center text-sm text-primary">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Self-Analysis
          </h4>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-2 opacity-50">
            Quality Control Report
          </p>
      </div>
      <div className="p-4 space-y-3 text-xs leading-relaxed text-foreground/80">
           <div className="flex justify-between items-center bg-foreground/5 p-2 rounded-xl">
              <span className="text-foreground/40">Evaluation</span>
              <span className="font-bold text-primary uppercase">{review.summaryEvaluation}</span>
           </div>
           {review.issuesFound && <div className="space-y-1"><p className="text-foreground/40 uppercase text-[9px] font-bold">Issues Found</p><p className="bg-red-500/5 p-2 rounded-xl border border-red-500/10">{review.issuesFound}</p></div>}
           {review.suggestedFixes && <div className="space-y-1"><p className="text-foreground/40 uppercase text-[9px] font-bold">Fix Suggestions</p><p className="bg-green-500/5 p-2 rounded-xl border border-red-500/10">{review.suggestedFixes}</p></div>}
           <div className="flex justify-between items-center border-t border-foreground/5 pt-3">
              <span className="text-foreground/40">Final Verdict</span>
              <span className="font-bold uppercase text-primary">{review.finalVerdict}</span>
           </div>
      </div>
    </PopoverContent>
  </Popover>
);

const TaskCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-[340px] animate-in slide-in-from-left-4 duration-500">
    <div className="p-7 relative bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
                <ListTodo className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-foreground text-lg font-bold">Intelligence Tasks</CardTitle>
        </div>
        <div className="space-y-3 relative">
            {data.tasks?.map((task: any, i: number) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 hover:bg-foreground/[0.06] transition-all group">
                    <Checkbox checked={task.completed} className="border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-bold text-foreground/90 truncate", task.completed && "line-through text-foreground/30")}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-[8px] uppercase tracking-widest h-4 px-1.5 border-none", 
                                task.priority === 'high' ? "bg-red-500/20 text-red-400" : "bg-foreground/5 text-foreground/30"
                            )}>
                                {task.priority} priority
                            </Badge>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    <div className="bg-background/50 p-4 border-t border-foreground/5">
        <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 h-12 rounded-2xl">
            <Plus className="h-4 w-4 mr-2" />
            Add To-Do Item
        </Button>
    </div>
  </Card>
);

const AlarmCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[300px] animate-in slide-in-from-left-4 duration-500">
    <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative group">
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
      <div className="relative bg-background/50 p-7 space-y-6 border-t border-foreground/5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.2em]">{data.alarmDetails?.label || 'General Reminder'}</p>
            <p className="text-4xl font-bold tracking-tighter text-foreground">{data.alarmDetails?.time}</p>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-primary scale-125" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-foreground/30" />
            <p className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">Repeats: <span className="text-foreground/60">One Time</span></p>
          </div>
          <button className="text-[10px] font-bold text-foreground/80 hover:text-foreground transition-colors uppercase tracking-widest">Edit</button>
        </div>
      </div>
    </Card>
    <Button className="w-full h-14 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-[2rem] border border-foreground/10 font-bold text-sm shadow-xl transition-all">
      Set Another Reminder
    </Button>
  </div>
);

const CalendarCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[340px] animate-in slide-in-from-left-4 duration-500">
    <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative">
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
            <CardTitle className="text-foreground text-lg font-bold">Schedule Update</CardTitle>
        </div>
      </div>
      <div className="relative bg-background/50 p-5 space-y-3 border-t border-foreground/5">
        {data.events?.map((event: any, i: number) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 group hover:bg-foreground/[0.06] hover:border-primary/30 transition-all cursor-pointer">
            <div className="text-center w-14 shrink-0 border-r border-foreground/5 pr-4">
              <p className="text-[9px] uppercase font-bold text-primary tracking-widest mb-1">{event.date}</p>
              <p className="text-sm font-bold text-foreground">{event.time.split(' ')[0]}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground/90 truncate group-hover:text-foreground">{(event.title || 'Untitled Event')}</p>
              <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">{event.time}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
          </div>
        ))}
      </div>
    </Card>
    <Button className="w-full h-14 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-[2rem] border border-foreground/10 font-bold text-sm shadow-xl transition-all">
      <Plus className="h-4 w-4 mr-2" />
      Create New Event
    </Button>
  </div>
);

const EmailCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-[340px] animate-in slide-in-from-left-4 duration-500">
    <div className="p-7 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
                <Mail className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-foreground text-lg font-bold">Inbox Overview</CardTitle>
        </div>
        <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-lg font-bold px-3 py-1 h-7">{data.emails?.length || 0} New</Badge>
      </div>
      <p className="relative text-sm text-foreground/60 leading-relaxed font-medium mb-2">
        {data.summary || "You have some important messages needing attention."}
      </p>
    </div>
    <div className="bg-background/50 p-4 space-y-2.5 border-t border-foreground/5">
      {data.emails?.map((email: any, i: number) => (
        <div key={i} className="p-4 rounded-3xl bg-foreground/[0.03] border border-foreground/5 hover:bg-foreground/[0.06] hover:border-primary/30 transition-all cursor-pointer group">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{email.sender}</p>
            <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">Recently</p>
          </div>
          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{email.subject}</p>
          <p className="text-xs text-foreground/40 line-clamp-2 mt-1.5 leading-relaxed">{email.snippet}</p>
        </div>
      ))}
      <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5 h-12 rounded-2xl">
        See All Messages
      </Button>
    </div>
  </Card>
);

const HospitalCard = ({ data }: { data: any }) => (
  <div className="space-y-4 max-w-[360px] animate-in slide-in-from-left-4 duration-500">
    {data.recommendations?.map((hosp: any, i: number) => (
      <Card key={i} className="overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
        <div className="p-6 relative space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative h-16 w-16 rounded-[1.25rem] overflow-hidden border-2 border-foreground/10 shadow-lg">
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
              <p className="text-lg font-bold text-foreground leading-tight truncate">{hosp.name}</p>
              <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest mt-1">{hosp.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-500">{hosp.rating}</span>
            </div>
            <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">{hosp.reviews}</span>
          </div>
        </div>
        <div className="flex border-t border-foreground/5 relative bg-foreground/[0.02]">
          <button className="flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all border-r border-foreground/5">
            <Globe className="h-4 w-4" />
            Portal
          </button>
          <button className="flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all">
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
  <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-[320px] animate-in slide-in-from-left-4 duration-500">
    <div className="relative aspect-[4/3] w-full bg-primary/5 flex items-center justify-center group">
       <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
       <Image 
          src={placeholderData.weather.imageUrl}
          alt="Weather Illustration"
          fill
          className="object-contain p-8 drop-shadow-2xl transition-transform group-hover:scale-110 duration-700"
          data-ai-hint="cloudy weather"
        />
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-foreground/10 backdrop-blur-2xl rounded-2xl px-4 py-2 border border-foreground/20 shadow-xl">
          <Cloud className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em]">{data.location}</span>
        </div>
    </div>
    <div className="bg-background/50 p-8 text-foreground relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-start">
            <p className="text-6xl font-bold tracking-tighter text-foreground">{data.temperature}</p>
            <span className="text-2xl font-bold text-primary mt-1">°</span>
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-foreground/40 mt-2">{data.condition}</p>
        </div>
        <Badge className="bg-primary/20 text-primary border border-primary/30 rounded-xl px-4 py-1.5 font-bold h-9">CELSIUS</Badge>
      </div>
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-foreground/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] uppercase font-bold tracking-widest text-foreground/30">Humidity</p>
            <p className="text-sm font-bold text-foreground">{data.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <Wind className="h-4 w-4 text-green-400" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] uppercase font-bold tracking-widest text-foreground/30">Wind</p>
            <p className="text-sm font-bold text-foreground">{data.windSpeed}km/h</p>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const ResearchCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-2xl animate-in slide-in-from-left-4 duration-500">
    <div className="p-7 relative bg-gradient-to-br from-primary/10 via-transparent to-transparent">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
          <Telescope className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-foreground text-xl font-bold">Intel Synthesis</CardTitle>
          <p className="text-[10px] uppercase tracking-widest font-bold text-primary/60">Research Report Module</p>
        </div>
      </div>
      <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
          {data.sections ? (
              data.sections.map((section: any, i: number) => (
                  <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <h4 className="font-bold text-foreground uppercase tracking-wider text-xs">{section.title}</h4>
                      </div>
                      <p className="text-foreground/60 pl-3.5 border-l border-foreground/5">{section.content}</p>
                  </div>
              ))
          ) : (
              <p className="whitespace-pre-wrap">{data.summary}</p>
          )}
      </div>
    </div>
    <div className="bg-background/50 p-4 border-t border-foreground/5 flex gap-3">
      <Button variant="ghost" className="flex-1 rounded-2xl h-12 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5">
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button className="flex-1 bg-primary text-white rounded-2xl h-12 font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95">
        Share Intel
      </Button>
    </div>
  </Card>
);

const BriefingCard = ({ data }: { data: any }) => (
  <Card className="mt-3 overflow-hidden border-foreground/10 bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-2xl max-w-xl animate-in slide-in-from-left-4 duration-500">
    <div className="p-8 relative bg-gradient-to-br from-primary/20 via-transparent to-transparent">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40">
                    <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                    <CardTitle className="text-foreground text-xl font-bold">Daily Synthesis</CardTitle>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{data.date}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                    <Cloud className="h-4 w-4 text-foreground/40" />
                    <span className="text-2xl font-bold text-foreground">{data.weather.temp}°</span>
                </div>
                <p className="text-[9px] uppercase font-bold text-foreground/30 tracking-widest">{data.weather.condition}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-5 rounded-3xl bg-foreground/[0.03] border border-foreground/5 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Schedule</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{data.eventsCount} <span className="text-sm font-medium text-foreground/40">Events</span></p>
                <div className="mt-4 space-y-1">
                    {data.topEvents.map((ev: string, i: number) => (
                        <p key={i} className="text-[10px] text-foreground/60 font-medium truncate">• {ev}</p>
                    ))}
                </div>
            </div>
            <div className="p-5 rounded-3xl bg-foreground/[0.03] border border-foreground/5 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Activity</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{data.emailsCount} <span className="text-sm font-medium text-foreground/40">Alerts</span></p>
                <div className="h-16 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.activityData}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={3} 
                              dot={false}
                              animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <p className="text-sm text-foreground/70 leading-relaxed font-medium bg-foreground/5 p-4 rounded-2xl border border-foreground/5">
            <Sparkles className="h-4 w-4 inline mr-2 text-primary" />
            {data.summary}
        </p>
    </div>
    <div className="bg-background/50 p-4 border-t border-foreground/5">
        <Link href="/dashboard" className="block w-full">
          <Button className="w-full h-12 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-2xl border border-foreground/10 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
              Open Full Dashboard
          </Button>
        </Link>
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
          isAi ? "border-foreground/10 bg-foreground/[0.03]" : "border-primary/40 bg-primary/20"
      )}>
          <AvatarFallback className="bg-transparent text-foreground">
              {isAi ? <Bot className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-foreground" />}
          </AvatarFallback>
      </Avatar>
      
      <div className={cn(
          "flex-1 pt-1 space-y-3",
          isAi ? "items-start" : "items-end flex flex-col"
      )}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/50">
            {isAi ? "AIva Intelligence" : "User Terminal"}
          </span>
          {isAi && review && <ReviewPopover review={review} />}
          {isVideo && <Badge variant="secondary" className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg h-6 px-2.5 text-[9px] uppercase font-bold tracking-widest"><Film className="w-3 h-3 mr-1.5" /> Veo 3.0</Badge>}
          {isAudio && <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 rounded-lg h-6 px-2.5 text-[9px] uppercase font-bold tracking-widest"><Music className="w-3 h-3 mr-1.5" /> AI Studio</Badge>}
          {isImageGen && <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 rounded-lg h-6 px-2.5 text-[9px] uppercase font-bold tracking-widest"><Sparkles className="w-3 h-3 mr-1.5" /> Gemini 2.0</Badge>}
        </div>

        <div className={cn(
            "relative max-w-full md:max-w-2xl px-6 py-4 rounded-[2rem] transition-all duration-300 shadow-2xl",
            isAi 
                ? "bg-foreground/[0.03] border border-foreground/10 rounded-tl-none text-foreground" 
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
                  isAi ? "text-foreground" : "text-white"
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
                  {toolData.type === 'research' && <ResearchCard data={toolData.data} />}
                  {toolData.type === 'briefing' && <BriefingCard data={toolData.data} />}
                  {toolData.type === 'task' && <TaskCard data={toolData.data} />}
                </div>
              )}

              {imageUrl && (
                <div className="mt-4 relative group/media overflow-hidden rounded-[2rem] border-2 border-foreground/5 shadow-2xl">
                  {isVideo ? (
                    <div className="relative aspect-video group/video bg-black overflow-hidden">
                        <video 
                          src={imageUrl} 
                          controls 
                          className="w-full h-full object-cover opacity-80 group-hover/video:opacity-100 transition-opacity"
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                            <Badge className="bg-red-600 text-white border-none text-[8px] font-bold h-5 uppercase tracking-widest px-2">Veo 3 PRO</Badge>
                            <Badge className="bg-black/40 backdrop-blur-md text-white/60 border-white/10 text-[8px] font-bold h-5 uppercase tracking-widest px-2">4K CINEMATIC</Badge>
                        </div>
                    </div>
                  ) : isAudio ? (
                    <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] flex flex-col gap-6 backdrop-blur-3xl relative overflow-hidden group/audio">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/audio:opacity-20 transition-opacity">
                            <Activity className="h-32 w-32 text-primary animate-pulse" />
                        </div>
                        <div className="relative flex items-center gap-5">
                            <div className="p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/30 group-hover/audio:scale-110 transition-transform">
                                <Music className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-base font-bold text-foreground block">Neural Studio Output</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">High Fidelity</span>
                                    <span className="w-1 h-1 rounded-full bg-foreground/20" />
                                    <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Spatial Track</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative bg-background/40 rounded-2xl p-4 border border-foreground/5 shadow-inner">
                            <audio controls className="w-full h-10 filter invert grayscale brightness-200 contrast-125">
                                <source src={imageUrl} />
                            </audio>
                        </div>
                    </div>
                  ) : (
                    <div className="relative group/image">
                        <Image
                          src={imageUrl}
                          alt={altText || "AI generated media"}
                          width={800}
                          height={500}
                          className="w-full h-auto object-cover transition-transform duration-1000 group-hover/image:scale-105"
                          data-ai-hint={dataAiHint}
                        />
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover/image:opacity-100 transition-opacity">
                             <Badge className="bg-primary/80 backdrop-blur-md text-white border-none text-[8px] font-bold h-5 uppercase tracking-widest px-2">G2 SYNTHESIS</Badge>
                        </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-none" />
                </div>
              )}
               
               {isAi && content && onPlayAudio && (
                <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-2xl border border-foreground/5 bg-foreground/[0.02] backdrop-blur-xl shadow-xl", 
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
