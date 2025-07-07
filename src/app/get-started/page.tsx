
'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function GetStartedPage() {
    return (
        <div className="bg-background text-foreground min-h-dvh flex flex-col font-sans px-8 py-12">
            <main className="flex-1 flex flex-col justify-between">
                <div className="mt-12">
                    <h1 className="text-6xl font-bold leading-none tracking-tight">
                        Your AI<br />
                        Companion
                    </h1>
                    <p className="text-3xl text-accent mt-4">for Everyday Tasks</p>
                </div>

                <div className="w-full">
                    <Separator className="bg-border/50 mb-6" />
                    <h2 className="text-2xl font-semibold mb-5">Get Started</h2>

                    <div className="space-y-4">
                        <Button asChild variant="secondary" className="w-full rounded-full font-semibold h-14 text-base">
                            <Link href="/login">Login to Account</Link>
                        </Button>
                        <Button asChild variant="default" className="w-full rounded-full font-semibold h-14 text-base">
                           <Link href="#">Create new Account</Link>
                        </Button>
                    </div>

                    <Separator className="bg-border/50 my-8" />
                    
                    <div className="text-center space-y-5">
                         <h2 className="text-lg font-medium text-muted-foreground">Or Continue With</h2>
                         <div className="flex justify-center gap-3">
                             <Button variant="outline" className="rounded-full flex-1 h-12 border-border text-muted-foreground hover:bg-card hover:text-foreground">
                                Google
                            </Button>
                             <Button variant="outline" className="rounded-full flex-1 h-12 border-border text-muted-foreground hover:bg-card hover:text-foreground">
                                Facebook
                            </Button>
                             <Button variant="outline" className="rounded-full flex-1 h-12 border-border text-muted-foreground hover:bg-card hover:text-foreground">
                                Apple
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
