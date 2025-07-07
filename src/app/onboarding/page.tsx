'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();

    return (
        <div className="bg-primary text-white min-h-dvh flex flex-col relative overflow-hidden">
            
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://placehold.co/800x1200.png"
                    data-ai-hint="man portrait suit"
                    alt="A man in a suit smiling"
                    layout="fill"
                    objectFit="cover"
                    className="transform -rotate-[15deg] scale-125 opacity-70"
                />
            </div>
            
            <div className="absolute inset-0 z-10">
                <svg className="w-full h-full" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H390V460C390 460 353.5 544 195 544C36.5 544 0 460 0 460V0Z" fill="hsl(var(--background))"/>
                </svg>
            </div>

            <div className="relative z-20 flex flex-col flex-1 text-foreground p-8">
                <main className="pt-16 flex-1">
                    <h1 className="text-6xl font-bold leading-none tracking-tight">
                        Empowering<br />
                        Your Digital<br />
                        Life with AI
                    </h1>
                    <p className="mt-6 text-muted-foreground text-base max-w-[300px]">
                        Aiva's interactive chatbot feature enables seamless communication between users and the virtual assistant
                    </p>
                </main>

                <footer className="w-full flex justify-between items-center mt-auto">
                    <Button variant="outline" size="icon" onClick={() => router.push('/')} className="bg-white/10 rounded-full h-14 w-14 backdrop-blur-sm border-white/20 text-white hover:bg-white/30">
                        <ArrowLeft className="h-7 w-7" />
                    </Button>
                    <Button asChild variant="secondary" className="rounded-full h-14 px-8 font-semibold text-lg">
                        <Link href="/get-started">Get Started</Link>
                    </Button>
                </footer>
            </div>
        </div>
    );
}
