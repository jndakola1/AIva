
'use client';

import { Bell, Menu, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { enhancePrompt } from '@/ai/flows/enhance-prompt';

const RecentPromptCard = ({ text, onClick }: { text: string, onClick: (text: string) => void }) => (
    <Card className="bg-card border-border p-4 hover:bg-muted cursor-pointer" onClick={() => onClick(text)}>
        <CardContent className="p-0">
            <p className="text-sm text-white/90">{text}</p>
        </CardContent>
    </Card>
);


export default function NewPromptPage() {
    const [prompt, setPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleEnhance = async () => {
        if (!prompt.trim()) return;
        setIsEnhancing(true);
        try {
            const result = await enhancePrompt({ prompt });
            setPrompt(result.enhancedPrompt);
        } catch (error) {
            console.error("Failed to enhance prompt:", error);
            toast({
                variant: "destructive",
                title: "Enhancement Failed",
                description: "Could not enhance the prompt. This is an online-only feature.",
            });
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        router.push(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
    };
    
    const recentPrompts = [
        "Can you give me the forecast for the weekend?",
        "What's the best way to start a new fitness routine?",
    ];

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

            <main className="flex-1 px-6 flex flex-col overflow-y-auto no-scrollbar pb-8">
                <div className="py-6">
                    <h1 className="text-4xl font-bold">Generate new Prompt</h1>
                </div>

                <div className="space-y-6 flex-1">
                    <div>
                        <label htmlFor="prompt" className="text-lg font-semibold mb-3 block">Your Prompt</label>
                        <Textarea 
                            id="prompt"
                            placeholder="e.g. create a marketing campaign for a new product..."
                            className="bg-card border-border rounded-xl min-h-[120px] text-base p-4"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <Button variant="outline" className="rounded-full bg-transparent border-border text-white text-sm px-4 py-2 h-auto mt-3 gap-2" onClick={handleEnhance} disabled={isEnhancing || !prompt.trim()}>
                           {isEnhancing ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                               <Sparkles className="h-4 w-4 text-accent" />
                           )}
                           Enhance with AI
                        </Button>
                    </div>

                    <div>
                        <label htmlFor="category" className="text-lg font-semibold mb-3 block">Select Category</label>
                        <Select defaultValue="weather">
                            <SelectTrigger className="w-full bg-card border-border rounded-full h-12 text-base px-5">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weather">Weather</SelectItem>
                                <SelectItem value="schedule">Schedule</SelectItem>
                                <SelectItem value="health">Health</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3">Recent Prompts</h2>
                        <div className="space-y-3">
                            {recentPrompts.map((p, i) => (
                                <RecentPromptCard key={i} text={p} onClick={setPrompt} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="px-6 py-4 shrink-0 bg-background">
                <Button onClick={handleGenerate} className="w-full bg-primary text-primary-foreground rounded-full text-lg font-semibold h-14 hover:bg-primary/90">
                    Generate
                </Button>
            </footer>
        </div>
    );
}
