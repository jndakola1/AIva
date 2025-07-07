'use client';

import { Bell, Bot, Copy, Menu, Mic, Pencil, RefreshCw, Send, Volume2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import React from 'react';

const Message = ({ msg }: { msg: { role: 'user' | 'ai', content: string } }) => {
    const isAi = msg.role === 'ai';

    return (
        <div className={cn("flex items-start gap-3", !isAi && "justify-end")}>
            {isAi && (
                <Avatar className="h-10 w-10 bg-accent shrink-0 border-2 border-accent/50">
                    <AvatarFallback className="bg-transparent">
                        <Bot className="h-6 w-6 text-white" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn("flex-1 max-w-[85%]", !isAi && "text-right")}>
                <p className="font-bold mb-2">{isAi ? "Aiva AI" : "You"}</p>
                <p className="text-muted-foreground leading-relaxed">{msg.content}</p>
                 <div className={cn("flex items-center gap-4 mt-3 text-muted-foreground", isAi ? "justify-start" : "justify-end")}>
                    {isAi ? (
                        <>
                            <Volume2 className="h-5 w-5 cursor-pointer hover:text-white" />
                            <Copy className="h-5 w-5 cursor-pointer hover:text-white" />
                            <RefreshCw className="h-5 w-5 cursor-pointer hover:text-white" />
                        </>
                    ) : (
                        <Pencil className="h-4 w-4 cursor-pointer hover:text-white" />
                    )}
                </div>
            </div>

            {!isAi && (
                 <Avatar className="h-10 w-10 bg-gray-700 shrink-0">
                    <AvatarFallback className="bg-transparent text-white" />
                </Avatar>
            )}
        </div>
    );
}

export default function ConversationPage() {
    const conversation = [
        { type: 'timestamp', value: '11:45 AM' },
        { type: 'message', role: 'user' as const, content: "Can you give me the forecast for the weekend?" },
        { type: 'message', role: 'ai' as const, content: "The forecast for the weekend predicts mostly sunny skies with temperatures ranging from 75 to 80 degrees Fahrenheit. There's a slight chance of showers on Saturday afternoon, but overall, it should be a pleasant weekend for outdoor activities." },
        { type: 'timestamp', value: '01:15 PM' },
        { type: 'message', role: 'user' as const, content: "Can you tell me about the air quality index?" },
        { type: 'message', role: 'ai' as const, content: "The Air Quality Index (AQI) for your area is currently rated as 'Good'. This means the air quality is acceptable; however, there may be some pollutants that pose a moderate health concern for a very small number of people who are unusually sensitive to air pollution." },
    ];

    const [input, setInput] = useState('');

    return (
        <div className="bg-background text-white min-h-dvh flex flex-col font-sans">
            <header className="flex justify-between items-center p-4 pt-8 md:pt-4 z-10 shrink-0">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
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
                    <div className="space-y-6 py-6">
                        {conversation.map((item, index) => {
                            if (item.type === 'timestamp') {
                                return <p key={index} className="text-center text-muted-foreground text-xs">{item.value}</p>;
                            }
                            if (item.type === 'message') {
                                return <Message key={index} msg={item as { role: 'user' | 'ai', content: string }} />;
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
                    <Button variant="ghost" size="icon" className="rounded-full bg-card h-12 w-12 shrink-0">
                        <Mic className="h-6 w-6 text-muted-foreground" />
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