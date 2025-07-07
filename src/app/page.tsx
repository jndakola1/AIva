'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SplashPage() {
    return (
        <div className="bg-background text-white min-h-dvh flex flex-col">
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="h-40 w-40 mb-8 flex items-center justify-center">
                    <div className="relative h-full w-full">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                        <div className="absolute inset-[10%] rounded-full bg-primary/30 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="absolute inset-[20%] rounded-full bg-primary/40 animate-pulse [animation-delay:0.4s]"></div>
                        <div className="absolute inset-[30%] rounded-full bg-primary flex items-center justify-center">
                            <span className="text-7xl font-bold text-primary-foreground -mt-2">A</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-white">Aiva</h1>
                <p className="mt-2 text-muted-foreground text-lg">How Can I Help You Today?</p>
            </main>
            
            <footer className="px-6 pb-8 pt-4 shrink-0">
                <Button asChild className="w-full bg-primary text-primary-foreground rounded-full text-lg font-semibold h-14 hover:bg-primary/90">
                    <Link href="/onboarding">Get Started</Link>
                </Button>
            </footer>
        </div>
    );
}
