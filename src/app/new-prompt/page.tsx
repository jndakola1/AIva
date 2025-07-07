
'use client';

import { Bell, Menu, Sparkles, ChevronDown } from 'lucide-react';
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

const RecentPromptCard = ({ text }: { text: string }) => (
    <Card className="bg-card border-border p-4">
        <CardContent className="p-0">
            <p className="text-sm text-white/90">{text}</p>
        </CardContent>
    </Card>
);


export default function NewPromptPage() {
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
                        />
                        <Button variant="outline" className="rounded-full bg-transparent border-border text-white text-sm px-4 py-2 h-auto mt-3 gap-2">
                           <Sparkles className="h-4 w-4 text-accent" />
                           Enhance with AI
                        </Button>
                    </div>

                    <div>
                        <label htmlFor="category" className="text-lg font-semibold mb-3 block">Select Category</label>
                        <Select>
                            <SelectTrigger className="w-full bg-card border-border rounded-full h-12 text-base px-5">
                                <SelectValue placeholder="Weather" />
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
                            <RecentPromptCard text="Can you give me the forecast for the weekend?" />
                            <RecentPromptCard text="What's the best way to start a new fitness routine?" />
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="px-6 py-4 shrink-0 bg-background">
                <Button className="w-full bg-primary text-primary-foreground rounded-full text-lg font-semibold h-14 hover:bg-primary/90">
                    Generate
                </Button>
            </footer>
        </div>
    );
}
