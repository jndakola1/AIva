'use client';

import { Bell, Menu, X, Plus, AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Waveform = () => (
    <div className="flex items-center justify-center gap-3 text-white h-16">
        <div className="w-3 h-3 rounded-full bg-white"></div>
        <div className="w-3 h-6 rounded-lg bg-white"></div>
        <div className="w-3 h-9 rounded-lg bg-white"></div>
        <div className="w-3 h-12 rounded-lg bg-white"></div>
        <div className="w-3 h-16 rounded-lg bg-white"></div>
        <div className="w-3 h-16 rounded-lg bg-white"></div>
        <div className="w-3 h-12 rounded-lg bg-white"></div>
        <div className="w-3 h-9 rounded-lg bg-white"></div>
        <div className="w-3 h-6 rounded-lg bg-white"></div>
        <div className="w-3 h-3 rounded-full bg-white"></div>
    </div>
);


export default function AudioPage() {
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

            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-12">
                <div className="w-24 h-24 rounded-full bg-card"></div>
                <Waveform />
                <div>
                    <p className="text-muted-foreground text-sm mb-2">Translated as</p>
                    <p className="text-3xl font-semibold leading-snug">"Are there any weather warnings in my area?"</p>
                </div>
            </main>
            
            <footer className="px-6 pt-8 pb-4 shrink-0 mt-auto">
                <div className="flex justify-between items-center">
                    <Button asChild variant="outline" size="icon" className="rounded-full bg-card h-16 w-16 border-gray-700">
                        <Link href="/weather">
                            <X className="h-8 w-8 text-white" />
                        </Link>
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full bg-white h-20 w-20">
                        <AudioLines className="h-10 w-10 text-black" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full bg-card h-16 w-16 border-gray-700">
                        <Plus className="h-8 w-8 text-white" />
                    </Button>
                </div>
                 <div className="pt-8">
                    <div className="w-32 h-1.5 bg-white rounded-full mx-auto"></div>
                </div>
            </footer>
        </div>
    );
}
