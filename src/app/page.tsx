'use client';

import { X, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SplashPage() {
    return (
        <div className="bg-background text-white min-h-dvh flex flex-col font-sans p-6">
            <header className="flex-1 pt-20">
                <h1 className="text-7xl font-bold">Aiva</h1>
                <p className="text-2xl text-accent mt-1">AI Virtual Assistant</p>
                <div className="w-full h-px bg-border my-8"></div>
            </header>
            
            <footer className="pb-8">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-full bg-card h-14 w-14 border-border">
                            <X className="h-7 w-7 text-white" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full bg-card h-14 w-14 border-border">
                            <MoreHorizontal className="h-7 w-7 text-white" />
                        </Button>
                    </div>
                    <Button asChild variant="secondary" size="icon" className="rounded-full bg-white h-16 w-16">
                        <Link href="/dashboard">
                            <ArrowUpRight className="h-8 w-8 text-black" />
                        </Link>
                    </Button>
                </div>
                <div className="pt-8 mt-4">
                    <div className="w-32 h-1.5 bg-white rounded-full mx-auto"></div>
                </div>
            </footer>
        </div>
    );
}
