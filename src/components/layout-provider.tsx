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
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatHistory } from '@/context/chat-history-context';

export function LayoutProvider({ children }: { children: React.Node }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { messages } = useChatHistory();

  // Close the sheet on route change
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/audio', label: 'Video Chat', icon: Video },
    { href: '/history', label: 'History', icon: History },
  ];

  const handleNewChat = () => {
    // If on home, we could trigger a clear or just refresh
    if (pathname === '/') {
      window.location.href = '/'; // Simple refresh to clear local state if not persistent
    } else {
      router.push('/');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <nav className="hidden md:flex flex-col items-center gap-4 px-3 py-6 border-r border-border bg-card/20 w-16 lg:w-64 transition-all">
          <div className="flex items-center gap-3 w-full px-2 mb-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <span className="hidden lg:block font-bold text-xl tracking-tight">AIva</span>
          </div>

          <Button 
            onClick={handleNewChat}
            variant="outline" 
            className="w-full lg:justify-start gap-2 mb-4 border-dashed border-primary/40 hover:border-primary transition-all"
          >
            <PlusCircle className="h-4 w-4 text-primary" />
            <span className="hidden lg:block">New Chat</span>
          </Button>

          <div className="flex flex-col gap-2 w-full">
            {navLinks.map((link) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname === link.href ? 'secondary' : 'ghost'}
                    className={cn(
                      "w-full lg:justify-start gap-3 rounded-xl transition-all",
                      pathname === link.href ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                    )}
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon className="h-5 w-5 shrink-0" />
                      <span className="hidden lg:block font-medium">{link.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-auto w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={pathname === '/settings' ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full lg:justify-start gap-3 rounded-xl transition-all",
                    pathname === '/settings' ? "bg-primary/10 text-primary" : "text-muted-foreground"
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
            <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-background/80 backdrop-blur-md px-4 border-b md:hidden">
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg tracking-tight">AIva</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={handleNewChat} variant="ghost" size="icon" className="rounded-full">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </Button>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                      <SheetTrigger asChild>
                        <Button size="icon" variant="ghost">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                          <div className="flex flex-col h-full bg-card">
                            <SheetHeader className="p-6 border-b bg-muted/20">
                              <SheetTitle className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                                  <Bot className="h-6 w-6" />
                                </div>
                                <span>AIva Assistant</span>
                              </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-2 p-4 flex-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                          "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-base font-medium",
                                          pathname === link.href 
                                            ? "bg-primary/10 text-primary" 
                                            : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="mt-4 pt-4 border-t border-border">
                                  <Link
                                      href="/settings"
                                      className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-base font-medium",
                                        pathname === "/settings" 
                                          ? "bg-primary/10 text-primary" 
                                          : "text-muted-foreground hover:bg-muted"
                                      )}
                                  >
                                      <Settings className="h-5 w-5" />
                                      Settings
                                  </Link>
                                </div>
                            </nav>
                            <div className="p-6 text-xs text-muted-foreground text-center bg-muted/10">
                              v1.0.0 Stable
                            </div>
                          </div>
                      </SheetContent>
                  </Sheet>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative overflow-hidden pb-16 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around bg-background/95 backdrop-blur-lg border-t md:hidden safe-area-bottom">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <link.icon className={cn("h-5 w-5", pathname === link.href && "scale-110")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
                  {pathname === link.href && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}
                </Link>
              ))}
              <Link
                  href="/settings"
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative",
                    pathname === '/settings' ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Settings className={cn("h-5 w-5", pathname === '/settings' && "scale-110")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                  {pathname === '/settings' && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}
                </Link>
            </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
