
'use client';

import { Bell, Bot, Copy, Menu, Mic, RefreshCw, Send, Sun, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { weatherAssistant, WeatherAssistantOutput } from '@/ai/flows/weather-assistant';

type WeatherData = NonNullable<WeatherAssistantOutput['weatherData']>;

type Message = {
  role: 'user' | 'ai';
  content: string;
  weatherData?: WeatherData;
  timestamp: string;
};

const WeatherStat = ({ label, value, unit = '' }: { label: string, value: number, unit?: string }) => {
    const markers = unit === '%' ? ['0%', '50%', '100%'] : (unit === '°F' ? ['0', '50', '100'] : ['0', '50', '100']);
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">{label}</label>
            <Progress value={value} className="h-1 bg-white/20 [&>div]:bg-white" />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{markers[0]}</span>
                <span>{markers[1]}</span>
                <span>{markers[2]}</span>
            </div>
        </div>
    );
};

const MessageCard = ({ msg }: { msg: Message }) => {
    const isAi = msg.role === 'ai';

    return (
        <div className={cn("flex items-start gap-3 w-full", !isAi && "justify-end")}>
            {isAi && (
                <Avatar className="h-10 w-10 bg-green-400/20 shrink-0 border-2 border-green-400/50">
                    <AvatarFallback className="bg-transparent">
                        <Bot className="h-6 w-6 text-green-400" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn("flex flex-col w-full max-w-[85%]", !isAi && "items-end")}>
                <div className={cn(
                    "rounded-2xl px-4 py-3",
                    isAi ? "bg-card rounded-tl-none" : "bg-primary text-primary-foreground rounded-br-none"
                )}>
                    <p className="font-bold mb-1 text-sm">{isAi ? "Aiva AI" : "You"}</p>
                    <p className="leading-relaxed">{msg.content}</p>
                </div>
                
                {isAi && msg.weatherData && (
                    <div className="text-left w-full mt-4 p-4 rounded-2xl bg-card">
                        <div className="flex items-center gap-2 mb-4">
                            <Sun className="h-5 w-5 text-white" />
                            <p className="font-semibold">{msg.weatherData.condition}</p>
                        </div>
                        <div className="space-y-4">
                            <WeatherStat label="Temperature" value={msg.weatherData.temperature} unit="°F" />
                            <WeatherStat label="Humidity" value={msg.weatherData.humidity} unit="%" />
                            <WeatherStat label="Air Quality Index (AQI)" value={msg.weatherData.aqi} />
                        </div>
                         {msg.weatherData.notes && (
                            <div className="text-left w-full mt-4 pt-4 border-t border-border">
                                <p className="text-sm font-semibold mb-1">*Notes</p>
                                <p className="text-xs text-muted-foreground">{msg.weatherData.notes}</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className={cn("flex items-center gap-2 mt-2 text-muted-foreground", isAi ? "w-full" : "")}>
                     <span className="text-xs">{msg.timestamp}</span>
                </div>
            </div>
        </div>
    );
}

export default function WeatherAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        if (typeof window !== "undefined") {
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
            setIsOffline(!navigator.onLine);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            }
        };
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
              viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);


    const sendMessage = async () => {
        if (!input.trim()) return;

        const newUserMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsSending(true);

        try {
            const result = await weatherAssistant({ prompt: input });
            const newAiMessage: Message = {
                role: 'ai',
                content: result.answer,
                weatherData: result.weatherData,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newAiMessage]);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not get a response from the Weather Assistant.'
            });
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="bg-background text-white min-h-dvh flex flex-col font-sans">
            <header className="flex justify-between items-center p-4 pt-8 md:pt-4 z-10 shrink-0">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                      <Menu className="h-7 w-7" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full bg-transparent border-border text-white text-base px-6 py-2 h-auto">
                        Weather Assistant
                    </Button>
                     <Badge variant={isOffline ? "destructive" : "secondary"} className="items-center gap-2 hidden md:flex">
                        {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4 text-accent" />}
                        <span className="font-semibold">{isOffline ? "Offline (tools disabled)" : "Online"}</span>
                    </Badge>
                </div>
                <Button variant="ghost" size="icon">
                    <Bell className="h-7 w-7" />
                </Button>
            </header>

            <main className="flex-1 px-4 flex flex-col overflow-y-auto no-scrollbar">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-8 py-6">
                        {messages.length === 0 && (
                            <div className="text-center pt-24">
                                <Sun className="h-16 w-16 mx-auto text-muted-foreground mb-4"/>
                                <h2 className="text-xl font-semibold">Weather Assistant</h2>
                                <p className="text-muted-foreground">Ask me about the weather in any location.</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                           <MessageCard key={index} msg={msg} />
                        ))}
                         {isSending && (
                            <div className="flex items-start gap-3 w-full">
                                <Avatar className="h-10 w-10 bg-green-400/20 shrink-0 border-2 border-green-400/50">
                                    <AvatarFallback className="bg-transparent">
                                        <Bot className="h-6 w-6 text-green-400" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-2xl px-4 py-3 bg-card rounded-tl-none">
                                     <div className="flex items-center space-x-1 p-1">
                                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </main>
            
            <footer className="px-4 py-3 shrink-0 bg-background">
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-card rounded-full flex items-center px-4 h-12">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessage();
                                }
                            }}
                            placeholder="Ask about the weather..."
                            className="bg-transparent border-none focus-visible:ring-0 text-base text-white placeholder:text-muted-foreground flex-1 h-auto py-2 px-0"
                            disabled={isSending || isOffline}
                        />
                    </div>
                    <Button asChild variant="ghost" size="icon" className="rounded-full bg-card h-12 w-12 shrink-0">
                        <Link href="/audio">
                            <Mic className="h-6 w-6 text-muted-foreground" />
                        </Link>
                    </Button>
                    <Button
                        size="icon"
                        className="bg-white hover:bg-gray-200 rounded-full h-12 w-12 shrink-0"
                        onClick={sendMessage}
                        disabled={isSending || isOffline || !input.trim()}
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <Send className="h-5 w-5 text-black" />}
                    </Button>
                </div>
            </footer>
        </div>
    );
}
