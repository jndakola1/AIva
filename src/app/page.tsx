import { Bell, CalendarDays, Film, HeartPulse, History, LayoutGrid, Menu, MessageSquare, Sun, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const BottomNavItem = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <Button variant="ghost" className={`flex-1 h-auto py-2 flex flex-col items-center justify-center gap-1 rounded-none text-xs ${active ? 'text-white' : 'text-muted-foreground'}`}>
      {icon}
  </Button>
);

const CategoryCard = ({ icon, title, promptCount, href }: { icon: React.ReactNode; title: string; promptCount: string, href: string }) => (
    <Link href={href} className="block flex-shrink-0 w-36">
        <Card className="bg-card border-none hover:bg-muted transition-colors text-white flex flex-col h-full p-4 aspect-square justify-center items-center">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center gap-2">
                {icon}
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground text-xs">{promptCount} Prompts</p>
            </CardContent>
        </Card>
    </Link>
);

const PopularPromptChip = ({ text }: { text: string }) => (
    <Button variant="outline" className="rounded-full border-muted-foreground/50 bg-transparent text-muted-foreground h-auto py-2 px-4 text-sm font-normal hover:bg-muted hover:text-white">
        {text}
    </Button>
);

const SectionHeader = ({ title, href }: { title: string, href?: string }) => (
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button asChild variant="ghost" size="icon">
            <Link href={href || "#"}>
                <ArrowRight className="h-5 w-5" />
            </Link>
        </Button>
    </div>
);

export default function HomePage() {
    const categories = [
        {
          href: "/weather",
          icon: <Sun className="h-7 w-7 text-white" />,
          title: "Weather",
          promptCount: "100",
        },
        {
          href: "#",
          icon: <CalendarDays className="h-7 w-7 text-white" />,
          title: "Schedule",
          promptCount: "120",
        },
        {
          href: "#",
          icon: <HeartPulse className="h-7 w-7 text-white" />,
          title: "Health",
          promptCount: "130",
        },
        {
          href: "#",
          icon: <Film className="h-7 w-7 text-white" />,
          title: "Entertainment",
          promptCount: "140",
        },
    ];

    const popularPrompts = [
        "What's the weather forecast for today?",
        "How can I maintain good health?",
        "Can you explain complex physics concepts?",
        "Any suggestions for a weekend trip?",
    ];

  return (
    <div className="bg-background text-white min-h-dvh flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 pt-8 md:pt-4 z-10 shrink-0">
        <Button variant="ghost" size="icon">
          <Menu className="h-7 w-7" />
        </Button>
        <Button variant="outline" className="rounded-full bg-transparent border-border text-white text-base px-6 py-2 h-auto">
          Aiva AI 2.0
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-7 w-7" />
        </Button>
      </header>

      <main className="flex-1 px-6 flex flex-col overflow-y-auto no-scrollbar pb-8">
        <div className="text-left py-10">
            <h1 className="text-5xl font-bold leading-tight">How Can I</h1>
            <h1 className="text-5xl font-bold text-accent">Help You Today?</h1>
        </div>

        <Button className="w-full bg-primary text-primary-foreground rounded-full text-lg font-semibold h-14 mb-10 hover:bg-primary/90">
            Generate new Prompt
        </Button>
        
        <div className="mb-10">
            <SectionHeader title="Prompt Categories" href="/categories" />
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
                {categories.map((category) => (
                    <CategoryCard key={category.title} {...category} />
                ))}
            </div>
        </div>

        <div className="mb-10">
            <SectionHeader title="Popular Prompt" />
            <div className="flex flex-wrap gap-3">
                {popularPrompts.map((prompt) => (
                    <PopularPromptChip key={prompt} text={prompt} />
                ))}
            </div>
        </div>
        
        <div className="mt-auto pt-10">
            <div className="bg-card p-8 rounded-t-3xl text-center">
                <h2 className="text-4xl font-bold">Upgrade to</h2>
            </div>
        </div>

      </main>

      <footer className="bg-black sticky bottom-0 w-full border-t border-border shrink-0">
        <div className="flex justify-around items-center text-gray-400">
            <BottomNavItem icon={<LayoutGrid size={28} />} active />
            <BottomNavItem icon={<MessageSquare size={28} />} />
            <BottomNavItem icon={<History size={28} />} />
            <BottomNavItem icon={<User size={28} />} />
        </div>
        <div className="pb-4 pt-2">
            <div className="w-32 h-1.5 bg-white rounded-full mx-auto"></div>
        </div>
      </footer>
    </div>
  );
}
