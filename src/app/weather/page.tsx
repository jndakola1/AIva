'use client';

import { Bell, Bot, Copy, Menu, Mic, Pencil, RefreshCw, Send, Volume2, Image as ImageIcon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import React from 'react';
import { Progress } from '@/components/ui/progress';

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

const Message = ({ msg }: { msg: { role: 'user' | 'ai', content: string, timestamp: string, weatherData?: any, notes?: string } }) => {
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
                <div className={cn("flex-1", !isAi && "text-right")}>
                    <p className="font-bold mb-2">{isAi ? "Aiva AI" : "You"}</p>
                    <p className="text-muted-foreground leading-relaxed">{msg.content}</p>
                </div>
                
                {isAi && msg.weatherData && (
                    <div className="text-left w-full mt-4">
                        <div className="border-t border-gray-700 mb-4"></div>
                        <div className="flex items-center gap-2 mb-4">
                            {msg.weatherData.icon}
                            <p className="font-semibold">{msg.weatherData.condition}</p>
                        </div>
                        <div className="space-y-4">
                            <WeatherStat label="Temperature" value={msg.weatherData.temperature} unit="°F" />
                            <WeatherStat label="Humidity" value={msg.weatherData.humidity} unit="%" />
                            <WeatherStat label="Air Quality Index (AQI)" value={msg.weatherData.aqi} />
                        </div>
                    </div>
                )}
                
                {isAi && msg.notes && (
                    <div className="text-left w-full mt-4">
                         <p className="text-sm font-semibold mb-1">*Notes</p>
                         <p className="text-xs text-muted-foreground">{msg.notes}</p>
                    </div>
                )}
                
                <div className={cn("flex items-center gap-2 mt-3 text-muted-foreground", isAi ? "w-full" : "")}>
                    {isAi ? (
                        <>
                            <Volume2 className="h-5 w-5 cursor-pointer hover:text-white" />
                            <Copy className="h-5 w-5 cursor-pointer hover:text-white" />
                            <RefreshCw className="h-5 w-5 cursor-pointer hover:text-white" />
                            <span className="text-xs ml-auto">{msg.timestamp}</span>
                        </>
                    ) : (
                        <>
                           <span className="text-xs">{msg.timestamp}</span>
                           <Pencil className="h-4 w-4 cursor-pointer hover:text-white" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function ConversationPage() {
    const conversation = [
        { type: 'message', role: 'user' as const, content: "Can you give me the forecast for the weekend? with graphics level.", timestamp: "02:05 PM" },
        { 
            type: 'message', 
            role: 'ai' as const, 
            content: "The forecast for the weekend predicts mostly sunny skies with temperatures ranging from 75 to 80 degrees Fahrenheit. Enjoy the sunshine!", 
            weatherData: {
                condition: 'Mostly Sunny',
                icon: <Sun className="h-5 w-5 text-white" />,
                temperature: 78,
                humidity: 50,
                aqi: 40
            },
            notes: "There may be some pollutants present that could pose a risk for sensitive individuals.",
            timestamp: "02:05 PM"
        },
    ];

    const [input, setInput] = useState('Are there any weather...');

    return (
        <div className="bg-background text-white min-h-dvh flex flex-col font-sans">
            <header className="flex justify-between items-center p-4 pt-8 md:pt-4 z-10 shrink-0">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                      <Menu className="h-7 w-7" />
                    </Link>
                </Button>
                <Button variant="outline" className="rounded-full bg-transparent border-border text-white text-base px-6 py-2 h-auto">
                    Aiva AI 2.0
                </Button>
                <Button variant="ghost" size="icon">
                    <Bell className="h-7 w-7" />
                </Button>
            </header>

            <main className="flex-1 px-4 flex flex-col overflow-y-auto no-scrollbar">
                <ScrollArea className="h-full">
                    <div className="space-y-8 py-6">
                        {conversation.map((item, index) => {
                            if (item.type === 'message') {
                                return <Message key={index} msg={item as { role: 'user' | 'ai', content: string, timestamp: string, weatherData?: any, notes?: string }} />;
                            }
                            return null;
                        })}
                    </div>
                </ScrollArea>
            </main>
            
            <footer className="px-4 py-3 shrink-0 bg-background">
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-card rounded-full flex items-center px-4 h-12">
                        <ImageIcon className="h-6 w-6 text-muted-foreground mr-3" />
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your prompts here"
                            className="bg-transparent border-none focus-visible:ring-0 text-base text-white placeholder:text-muted-foreground flex-1 h-auto py-2 px-0"
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
                    >
                        <Send className="h-5 w-5 text-black" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
