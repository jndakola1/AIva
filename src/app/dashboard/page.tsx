'use client';

import React from 'react';
import { 
  Zap, 
  Calendar as CalendarIcon, 
  Mail, 
  Cloud, 
  Clock, 
  ChevronLeft, 
  Activity, 
  Bell, 
  ChevronRight, 
  MoreHorizontal,
  Sparkles,
  Search,
  ArrowUpRight,
  Droplets,
  Wind,
  ListTodo,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const activityData = [
  { time: '6AM', value: 5 },
  { time: '8AM', value: 15 },
  { time: '10AM', value: 45 },
  { time: '12PM', value: 20 },
  { time: '2PM', value: 85 },
  { time: '4PM', value: 30 },
  { time: '6PM', value: 12 },
  { time: '8PM', value: 40 },
];

const mockEvents = [
  { title: "Neural Sync Kickoff", time: "09:30 AM", category: "Core Sync", color: "bg-blue-500" },
  { title: "Executive Board Review", time: "11:00 AM", category: "Strategy", color: "bg-primary" },
  { title: "Client Vision Demo", time: "02:00 PM", category: "External", color: "bg-indigo-500" },
  { title: "Deep Synthesis Session", time: "04:30 PM", category: "Neural", color: "bg-amber-400" },
];

const mockTasks = [
    { title: "Review Q3 Vision Doc", completed: false, priority: "High" },
    { title: "Approve Architecture Proposal", completed: false, priority: "High" },
    { title: "Schedule Team Retro", completed: true, priority: "Medium" },
    { title: "Synthesize Market Intel", completed: false, priority: "Low" },
];

const mockEmails = [
  { sender: "Sarah Chen", subject: "Q3 Vision Document", time: "10m ago", read: false },
  { sender: "Project AIva", subject: "Synthesis Complete", time: "25m ago", read: false },
  { sender: "Operations", subject: "Server Status Alert", time: "1h ago", read: true },
];

export default function NeuralDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Immersive Header */}
      <header className="p-8 flex items-center justify-between border-b border-foreground/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground h-12 w-12 border border-foreground/10"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 h-5 text-[9px] uppercase tracking-widest font-bold">Neural Sync: 98%</Badge>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/30">AIva OS v1.2</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full bg-foreground/5 h-12 w-12 border border-foreground/10 relative">
                <Bell className="h-5 w-5 text-foreground/60" />
                <span className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full border-2 border-background" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-foreground/5 h-12 w-12 border border-foreground/10">
                <MoreHorizontal className="h-5 w-5 text-foreground/60" />
            </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <main className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
          
          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-10 rounded-[3rem] bg-foreground/[0.02] border border-foreground/5 backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                <div className="relative flex flex-col md:flex-row justify-between gap-8 h-full">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest text-foreground/40">Status: Terminal Active</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-7xl font-bold tracking-tighter text-foreground">09:42 <span className="text-3xl text-foreground/30">AM</span></p>
                            <p className="text-2xl font-medium text-foreground/60">Tuesday, October 24</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <div className="px-5 py-3 rounded-2xl bg-foreground/5 border border-foreground/10">
                                <p className="text-[9px] uppercase font-bold text-foreground/30 tracking-widest mb-1">Focus Score</p>
                                <p className="text-xl font-bold text-primary">84%</p>
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-foreground/5 border border-foreground/10">
                                <p className="text-[9px] uppercase font-bold text-foreground/30 tracking-widest mb-1">Tasks Pending</p>
                                <p className="text-xl font-bold text-foreground">12</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-64 h-full min-h-[160px] flex items-end">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData}>
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={4} 
                                    dot={false}
                                    animationDuration={2500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Weather Detail */}
            <div className="p-10 rounded-[3rem] bg-foreground/[0.02] border border-foreground/5 backdrop-blur-3xl relative flex flex-col justify-between overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-50" />
                <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Cloud className="h-6 w-6 text-indigo-400" />
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-bold">BANDUNG</Badge>
                    </div>
                    <div className="flex items-start">
                        <p className="text-7xl font-bold tracking-tighter text-foreground">24</p>
                        <span className="text-3xl font-bold text-indigo-400 mt-2">°C</span>
                    </div>
                    <p className="text-xl font-bold text-foreground/60 mt-2 uppercase tracking-widest">Partly Cloudy</p>
                </div>
                <div className="relative grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-foreground/5">
                    <div className="flex items-center gap-3">
                        <Droplets className="h-4 w-4 text-indigo-400" />
                        <div>
                            <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Humidity</p>
                            <p className="text-sm font-bold text-foreground">78%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Wind className="h-4 w-4 text-indigo-400" />
                        <div>
                            <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Wind</p>
                            <p className="text-sm font-bold text-foreground">12 km/h</p>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* Task Terminal & Schedule Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Task Terminal */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <ListTodo className="h-5 w-5 text-primary" />
                        Intelligence Action Items
                    </h2>
                    <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10">Add Task</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockTasks.map((task, i) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-foreground/[0.03] border border-foreground/5 flex items-center gap-5 group hover:bg-foreground/[0.06] hover:border-primary/20 transition-all cursor-pointer">
                            <Checkbox checked={task.completed} className="h-6 w-6 rounded-lg border-foreground/10" />
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-bold text-foreground transition-all truncate", task.completed && "text-foreground/20 line-through")}>{task.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge className={cn("text-[8px] font-bold border-none h-4", task.priority === 'High' ? "bg-red-500/20 text-red-400" : "bg-foreground/5 text-foreground/40")}>{task.priority}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Communication Terminal */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Mail className="h-5 w-5 text-indigo-400" />
                        Comm Intercept
                    </h2>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-none">3 NEW</Badge>
                </div>
                <div className="space-y-4">
                    {mockEmails.map((email, i) => (
                        <div key={i} className="p-5 rounded-[2rem] bg-foreground/[0.03] border border-foreground/5 relative group hover:bg-foreground/[0.06] transition-all cursor-pointer">
                            {!email.read && <div className="absolute top-6 right-6 h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(217,119,87,0.8)]" />}
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{email.sender}</p>
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{email.subject}</p>
                            <p className="text-[10px] text-foreground/30 mt-2 uppercase tracking-widest font-bold">{email.time}</p>
                        </div>
                    ))}
                    <Button variant="ghost" className="w-full h-14 rounded-2xl border border-foreground/5 bg-foreground/5 hover:bg-foreground/10 text-foreground/60 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Open Comm Terminal
                    </Button>
                </div>
            </div>

          </section>

          {/* Schedule Visualization */}
          <section className="p-10 rounded-[3rem] bg-foreground/[0.02] border border-foreground/5 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50" />
              <div className="relative flex flex-col md:flex-row items-center gap-10">
                  <div className="h-32 w-32 bg-primary rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(217,119,87,0.3)]">
                      <CalendarIcon className="h-16 w-16 text-white" />
                  </div>
                  <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <h2 className="text-2xl font-bold tracking-tight">Upcoming Synthesis</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mockEvents.map((event, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-foreground/5 border border-foreground/10 space-y-2">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{event.time}</p>
                                <p className="text-sm font-bold text-foreground">{event.title}</p>
                            </div>
                        ))}
                      </div>
                  </div>
              </div>
          </section>

        </main>
      </ScrollArea>
      
      {/* Bottom Floating Branding */}
      <footer className="absolute bottom-8 left-0 right-0 pointer-events-none">
          <div className="max-w-7xl mx-auto px-8 flex justify-center">
              <div className="px-6 py-2 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-2xl">
                <p className="text-[10px] text-foreground/20 uppercase tracking-[0.4em] font-bold">Neural Engine v1.2 Active</p>
              </div>
          </div>
      </footer>
    </div>
  );
}