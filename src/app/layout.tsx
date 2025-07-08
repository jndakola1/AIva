import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { MessageSquare, History, Settings, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Aiva AI',
  description: 'Your AI Companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="antialiased font-sans">
        <TooltipProvider>
          <div className="min-h-screen w-full flex bg-background text-foreground">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-4 border-r border-border bg-card/40">
              <Link href="/" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-lg font-semibold md:h-8 md:w-8 md:text-base mb-4">
                <Bot className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Aiva AI</span>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" asChild>
                    <Link href="/">
                      <MessageSquare className="h-5 w-5" />
                      <span className="sr-only">Chat</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" asChild>
                    <Link href="/history">
                      <History className="h-5 w-5" />
                      <span className="sr-only">History</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">History</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="rounded-lg mt-auto" asChild>
                    <Link href="/settings">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </nav>

            <main className="flex-1 flex flex-col h-screen">
              {children}
            </main>
          </div>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
