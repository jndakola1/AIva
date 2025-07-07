'use client';

import { Bell, CalendarDays, HeartPulse, History, LayoutGrid, Menu, MessageSquare, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BottomNavItem = ({ icon, active = false, href }: { icon: React.ReactNode, active?: boolean, href?: string }) => (
    <Link href={href || "#"} className={`flex-1 h-auto py-2 flex flex-col items-center justify-center gap-1 rounded-none text-xs ${active ? 'text-white' : 'text-muted-foreground'}`}>
        {icon}
    </Link>
);

export default function CategoriesPage() {
    const categories = [
        {
            value: 'weather',
            icon: <Sun className="h-7 w-7 text-white" />,
            title: "Weather",
            description: "Questions about the current or future weather forecast, including information such as temperature, humidity, and weather conditions.",
            prompts: [
                "What's the weather forecast for today?",
                "Is it going to be sunny this afternoon?",
                "What's the temperature right now?",
                "Do I need an umbrella today?",
                "How windy is it outside?",
            ],
        },
        {
            value: 'schedule',
            icon: <CalendarDays className="h-7 w-7 text-white" />,
            title: "Schedule",
            description: "Manage your appointments, set reminders, and organize your day.",
            prompts: [],
        },
        {
            value: 'health',
            icon: <HeartPulse className="h-7 w-7 text-white" />,
            title: "Health",
            description: "Get information on symptoms, find doctors, and track your fitness goals.",
            prompts: [],
        }
    ];

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
                 <Accordion type="single" collapsible defaultValue="weather" className="w-full">
                    {categories.map((category) => (
                         <AccordionItem key={category.value} value={category.value} className="border-b border-gray-800 last:border-b-0">
                            <AccordionTrigger className="hover:no-underline py-4 text-white font-semibold text-lg">
                                <div className="flex items-center gap-4">
                                    {category.icon}
                                    <span>{category.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                {category.value === 'weather' && (
                                    <>
                                        <div className="flex items-start gap-6 mb-6">
                                            <Sun className="h-20 w-20 text-white shrink-0 mt-2" />
                                            <div>
                                                <h2 className="text-4xl font-bold mb-2">Weather</h2>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {category.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            {category.prompts.map(prompt => (
                                                <Button key={prompt} variant="outline" className="w-full justify-start rounded-full border-gray-700 bg-transparent h-auto py-3 px-5 text-sm font-normal text-white hover:bg-gray-800 hover:text-white">
                                                    {prompt}
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="flex justify-center items-center gap-2 mt-6">
                                            <span className="h-2 w-2 rounded-full bg-white"></span>
                                            <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                                            <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                                        </div>
                                    </>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </main>
            
            <footer className="bg-black sticky bottom-0 w-full border-t border-border shrink-0">
                <div className="flex justify-around items-center text-gray-400">
                    <BottomNavItem href="/" icon={<LayoutGrid size={28} />} />
                    <BottomNavItem href="/weather" icon={<MessageSquare size={28} />} />
                    <BottomNavItem href="#" icon={<History size={28} />} />
                    <BottomNavItem href="#" icon={<User size={28} />} />
                </div>
                <div className="pb-4 pt-2">
                    <div className="w-32 h-1.5 bg-white rounded-full mx-auto"></div>
                </div>
            </footer>
        </div>
    );
}
