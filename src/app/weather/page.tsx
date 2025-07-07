'use client';

import { ArrowLeft, Mic, MoreVertical, Send, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Message = {
    role: "user" | "ai";
    content: string;
};

const AiAvatar = () => (
    <Avatar className="h-8 w-8 bg-white shrink-0">
        <AvatarFallback className="bg-black">
            <Sun className="h-5 w-5 text-white" />
        </AvatarFallback>
    </Avatar>
);

const UserAvatar = () => (
    <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-gray-700 text-white">
            Y
        </AvatarFallback>
    </Avatar>
);

const ChatMessage = ({ role, content, isLoading = false }: Message & { isLoading?: boolean }) => {
    const isAi = role === "ai";
    return (
        <div className={cn('flex items-start gap-3', !isAi && 'justify-end')}>
            {isAi && <AiAvatar />}
            <div className={cn(
                'rounded-2xl p-4 max-w-[80%] text-white', 
                isAi ? 'bg-gray-800' : 'bg-blue-600',
                !isAi && 'rounded-br-none',
                isAi && 'rounded-bl-none'
            )}>
                 {isLoading ? (
                    <div className="flex items-center space-x-1 p-1">
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
                    </div>
                ) : (
                    <p className="text-sm">{content}</p>
                )}
            </div>
            {!isAi && <UserAvatar />}
        </div>
    );
};


export default function WeatherPage() {
    const searchParams = useSearchParams();
    const initialPrompt = searchParams.get('prompt');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
              viewport.scrollTop = viewport.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading) return;
        
        const newMessages: Message[] = [...messages, { role: 'user', content: prompt }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = "The weather in New York is currently sunny with a temperature of 24°C. The wind is blowing from the west at 10 km/h.";
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
            setIsLoading(false);
        }, 1500);
    }

    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            setMessages([{ role: 'user', content: initialPrompt }]);
            setIsLoading(true);
            setTimeout(() => {
                const aiResponse = "The weather in New York is currently sunny with a temperature of 24°C. The wind is blowing from the west at 10 km/h.";
                setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
                setIsLoading(false);
            }, 1500);
        }
    }, [initialPrompt]);
    
    return (
        <div className="bg-black text-white min-h-screen flex flex-col font-sans">
            <header className="flex justify-between items-center p-4 z-10 shrink-0 border-b border-gray-800">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg font-semibold">Weather</h1>
                    <p className="text-xs text-green-400">Online</p>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 px-4 py-6 flex flex-col overflow-y-auto no-scrollbar">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <ChatMessage key={index} role={msg.role} content={msg.content} />
                        ))}
                        {isLoading && (
                           <ChatMessage role="ai" content="" isLoading={true} />
                        )}
                    </div>
                </ScrollArea>
            </main>

            <footer className="p-4 shrink-0 border-t border-gray-800 bg-black">
                <div className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(input);
                            }
                        }}
                        placeholder="Type a message..."
                        className="bg-gray-900 border-gray-700 rounded-full pl-12 pr-20 h-14 text-base focus-visible:ring-blue-600"
                        disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Mic className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Button 
                            onClick={() => handleSendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
