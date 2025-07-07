
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    return (
        <div className="bg-background text-foreground min-h-dvh flex flex-col font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 z-0 pointer-events-none">
                <svg viewBox="0 0 390 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M0 0H390V175C390 175 342.5 293.5 195 293.5C47.5 293.5 0 175 0 175V0Z" fill="hsl(var(--card))"/>
                </svg>
            </div>
            
            <main className="flex-1 flex flex-col justify-center px-8 py-12 z-10">
                <div className="text-left mb-10">
                    <h1 className="text-5xl font-bold leading-tight">
                        Create new<br/>Account
                    </h1>
                    <p className="text-muted-foreground mt-4 text-sm max-w-sm">
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>

                <form className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="text"
                            placeholder="Type your username here"
                            className="bg-muted border-border rounded-full h-14 pl-12 text-base"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="email"
                            placeholder="Type your email here"
                            className="bg-muted border-border rounded-full h-14 pl-12 text-base"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="password"
                            placeholder="Type your password here"
                            className="bg-muted border-border rounded-full h-14 pl-12 text-base"
                        />
                    </div>
                </form>

                <div className="flex justify-between items-center mt-8">
                    <div className="flex gap-4">
                        <Link href="#" className="text-sm font-semibold text-foreground hover:underline">Terms of Use</Link>
                        <Link href="#" className="text-sm font-semibold text-foreground hover:underline">Privacy Policy</Link>
                    </div>
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 text-secondary-foreground">
                        <ArrowRight className="h-6 w-6" />
                    </Button>
                </div>
            </main>

            <footer className="pb-4 pt-8 px-8 shrink-0">
            </footer>
        </div>
    );
}
