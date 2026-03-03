
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from "@/components/chat-interface";
import ModeIndicator from "@/components/mode-indicator";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem('aiva_onboarded');
    if (!onboarded) {
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-background/50 backdrop-blur-xl border-b border-foreground/5 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">A</div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">AIva Terminal</h1>
        </div>
        <ModeIndicator />
      </header>
      <ChatInterface />
    </>
  );
}
