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
  Sparkles,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  // Handle Theme Application
  useEffect(() => {
    const applyTheme = () => {
      let activeTheme: 'light' | 'dark' = 'dark';
      
      if (settings.appearance.theme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        activeTheme = (settings.appearance.theme as 'light' | 'dark') || 'dark';
      }

      document.documentElement.classList.toggle('dark', activeTheme === 'dark');
      document.documentElement.style.colorScheme = activeTheme;
      
      // Map primary color selection to CSS variables defined in globals.css
      const colorMap: Record<string, string> = {
        orange: 'var(--primary-orange)',
        blue: 'var(--primary-blue)',
        green: 'var(--primary-green)',
        purple: 'var(--primary-purple)',
      };
      
      const colorValue = colorMap[settings.appearance.primaryColor] || colorMap['orange'];
      document.documentElement.style.setProperty('--primary', colorValue);
    };

    applyTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
        if (settings.appearance.theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settings.appearance.theme, settings.appearance.primaryColor]);

  const navLinks = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/categories', label: 'Features', icon: LayoutDashboard },
    { href: '/audio', label: 'Video Chat', icon: Video },
    { href: '/history', label: 'History', icon: History },
  ];

  const toggleTheme = () => {
    const currentTheme = settings.appearance.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.appearance.theme;
      
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateSettings('appearance', 'theme', nextTheme);
  };

  const handleNewChat = () => {
    if (pathname === '/') {
      window.location.reload();
    } else {
      router.push('/');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <nav className="hidden md:flex flex-col items-center gap-4 px-3 py-6 border-r border-foreground/5 bg-foreground/[0.02] backdrop-blur-2xl w-16 lg:w-64 transition-all">
          <div className="flex items-center gap-3 w-full px-2 mb-6 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-transform group-hover:scale-105">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">AIva</span>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Pro Assistant</p>
            </div>
          </div>

          <Button 
            onClick={handleNewChat}
            variant="ghost" 
            className="w-full lg:justify-start gap-3 mb-4 bg-foreground/5 hover:bg-foreground/10 border border-foreground/5 rounded-2xl transition-all group"
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
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-foreground/5"
                    )}
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon className={cn("h-5 w-5 shrink-0 transition-transform", pathname === link.href && "scale-110")} />
                      <span className="hidden lg:block font-medium">{link.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-auto w-full space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="w-full lg:justify-start gap-4 rounded-2xl transition-all h-12 text-muted-foreground hover:bg-foreground/5"
                >
                  {settings.appearance.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span className="hidden lg:block font-medium">Switch Theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">Toggle Theme</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full lg:justify-start gap-4 rounded-2xl transition-all h-12",
                    pathname === '/settings' ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-foreground/5"
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
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-background/80 backdrop-blur-xl px-4 border-b border-foreground/5 md:hidden">
                <div className="flex items-center gap-3" onClick={() => router.push('/')}>
                  <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-lg tracking-tight">AIva</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={toggleTheme} variant="ghost" size="icon" className="rounded-full bg-foreground/5">
                    {settings.appearance.theme === 'dark' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                  </Button>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                      <SheetTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full bg-foreground/5">
                            <Menu className="h-5 w-5 text-primary" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px] p-0 border-r border-foreground/5 bg-background">
                          <div className="flex flex-col h-full">
                            <SheetHeader className="p-6 border-b border-foreground/5 bg-foreground/[0.02]">
                              <SheetTitle className="flex items-center gap-4">
                                <div className="p-2.5 bg-primary rounded-2xl text-white">
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
                                            ? "bg-primary/10 text-primary border border-primary/20" 
                                            : "text-muted-foreground hover:bg-foreground/5"
                                        )}
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="mt-4 pt-4 border-t border-foreground/5">
                                  <Link
                                      href="/settings"
                                      className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-base font-medium",
                                        pathname === "/settings" 
                                          ? "bg-primary/10 text-primary border border-primary/20" 
                                          : "text-muted-foreground hover:bg-foreground/5"
                                      )}
                                  >
                                      <Settings className="h-5 w-5" />
                                      Settings
                                  </Link>
                                </div>
                            </nav>
                          </div>
                      </SheetContent>
                  </Sheet>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative overflow-hidden pb-20 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around bg-background/80 backdrop-blur-2xl border-t border-foreground/5 md:hidden px-4 pb-4">
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
                    pathname === link.href ? "bg-primary/10 scale-110 shadow-lg" : "group-hover:bg-foreground/5"
                  )}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{link.label}</span>
                </Link>
              ))}
            </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
