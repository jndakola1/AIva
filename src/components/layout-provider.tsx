'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bot, History, Menu, MessageSquare, Settings, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet on route change, which happens when a link is clicked.
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/audio', label: 'Video Chat', icon: Video },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex bg-background text-foreground">
        {/* Desktop Sidebar */}
        <nav className="hidden md:flex flex-col items-center gap-4 px-2 py-4 border-r border-border bg-card/40">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-lg font-semibold md:h-8 md:w-8 md:text-base mb-4"
          >
            <Bot className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Aiva AI</span>
          </Link>
          {navLinks.map((link) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Button
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-lg"
                  asChild
                >
                  <Link href={link.href}>
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={pathname === '/settings' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-lg mt-auto"
                asChild
              >
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
            {/* Mobile Header */}
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 bg-background px-4 md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                    <Button size="icon" variant="outline">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                        <SheetHeader>
                          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        </SheetHeader>
                        <nav className="flex h-full flex-col gap-6 text-lg font-medium pt-4">
                            <Link
                                href="/"
                                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base mb-4"
                            >
                                <Bot className="h-5 w-5 transition-all group-hover:scale-110" />
                                <span className="sr-only">Aiva AI</span>
                            </Link>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn("flex items-center gap-4 px-2.5", pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            ))}
                             <Link
                                href="/settings"
                                className={cn("flex items-center gap-4 px-2.5 mt-auto", pathname === "/settings" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                            >
                                <Settings className="h-5 w-5" />
                                Settings
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
            </header>
            <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
              {children}
            </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
