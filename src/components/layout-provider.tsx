'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { 
  Bot, 
  History, 
  Menu, 
  MessageSquare, 
  Settings, 
  Video, 
  PlusCircle,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatHistory } from '@/context/chat-history-context';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { messages } = useChatHistory();

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/categories', label: 'Features', icon: LayoutDashboard },
    { href: '/audio', label: 'Video Chat', icon: Video },
    { href: '/history', label: 'History', icon: History },
  ];

  const handleNewChat = () => {
    if (pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex bg-[#0A0A0B] text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <nav className="hidden md:flex flex-col items-center gap-4 px-3 py-6 border-r border-white/5 bg-white/[0.02] backdrop-blur-2xl w-16 lg:w-64 transition-all">
          <div className="flex items-center gap-3 w-full px-2 mb-6 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(217,119,87,0.5)] transition-transform group-hover:scale-105">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">AIva</span>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Pro Assistant</p>
            </div>
          </div>

          <Button 
            onClick={handleNewChat}
            variant="ghost" 
            className="w-full lg:justify-start gap-3 mb-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
          >
            <PlusCircle className="h-5 w-5 text-primary group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden lg:block font-semibold">New Session</span>
          </Button>

          <div className="flex flex-col gap-1.5 w-full">
            {navLinks.map((link) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full lg:justify-start gap-4 rounded-2xl transition-all h-12",
                      pathname === link.href 
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(217,119,87,0.1)]" 
                        : "text-muted-foreground hover:bg-white/5"
                    )}
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon className={cn("h-5 w-5 shrink-0 transition-transform", pathname === link.href && "scale-110")} />
                      <span className="hidden lg:block font-medium">{link.label}</span>
                      {pathname === link.href && <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(217,119,87,0.5)]" />}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-auto w-full space-y-2">
             <div className="hidden lg:block p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-white/5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Pro Status</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">You're currently using Gemini Pro & Veo 3 engine.</p>
             </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full lg:justify-start gap-4 rounded-2xl transition-all h-12",
                    pathname === '/settings' ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5"
                  )}
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:block font-medium">Settings</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">Settings</TooltipContent>
            </Tooltip>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col h-screen overflow-hidden">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-[#0A0A0B]/80 backdrop-blur-xl px-4 border-b border-white/5 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(217,119,87,0.4)]">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-tight">AIva</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={handleNewChat} variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </Button>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                      <SheetTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full bg-white/5 hover:bg-white/10 group">
                            <Menu className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px] p-0 border-r border-white/5 bg-[#0A0A0B]">
                          <div className="flex flex-col h-full">
                            <SheetHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                              <SheetTitle className="flex items-center gap-4">
                                <div className="p-2.5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                                  <Bot className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                  <span className="font-bold text-xl block">AIva Assistant</span>
                                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Pro Experience</span>
                                </div>
                              </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1.5 p-4 flex-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                          "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-base font-medium",
                                          pathname === link.href 
                                            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(217,119,87,0.2)]" 
                                            : "text-muted-foreground hover:bg-white/5"
                                        )}
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                  <Link
                                      href="/settings"
                                      className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-base font-medium",
                                        pathname === "/settings" 
                                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(217,119,87,0.2)]" 
                                          : "text-muted-foreground hover:bg-white/5"
                                      )}
                                  >
                                      <Settings className="h-5 w-5" />
                                      Settings
                                  </Link>
                                </div>
                            </nav>
                            <div className="p-6 text-[10px] text-muted-foreground/40 text-center uppercase tracking-[0.2em] font-bold">
                              AIva OS v1.2 Stable
                            </div>
                          </div>
                      </SheetContent>
                  </Sheet>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative overflow-hidden pb-20 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around bg-[#0A0A0B]/80 backdrop-blur-2xl border-t border-white/5 md:hidden px-4 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all relative group",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all",
                    pathname === link.href ? "bg-primary/10 scale-110 shadow-[0_0_15px_rgba(217,119,87,0.3)]" : "group-hover:bg-white/5"
                  )}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{link.label}</span>
                  {pathname === link.href && (
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(217,119,87,0.6)]" />
                  )}
                </Link>
              ))}
            </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
