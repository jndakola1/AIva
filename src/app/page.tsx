import { ArrowRight, Bell, CalendarDays, Film, HeartPulse, History, LayoutGrid, Menu, MessageSquare, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CategoryCard = ({ icon, title, prompts }: { icon: React.ReactNode, title: string, prompts: string }) => (
  <div className="bg-card rounded-2xl p-4 flex-shrink-0 w-36 flex flex-col justify-center items-center gap-2 text-center">
      {icon}
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{prompts}</p>
  </div>
);

const PopularPrompt = ({ text }: { text: string }) => (
  <Button variant="outline" className="rounded-full bg-transparent border-border text-foreground h-auto py-2 px-4 text-sm font-normal">
      {text}
  </Button>
);

const BottomNavItem = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <Button asChild variant="ghost" className={`rounded-full p-3 h-auto ${active ? 'text-white' : 'text-gray-500'} hover:text-white hover:bg-gray-800`}>
    <Link href="#">
      {icon}
    </Link>
  </Button>
);

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 pt-8 md:pt-4 z-10">
        <Button variant="ghost" size="icon">
          <Menu className="h-7 w-7" />
        </Button>
        <Button variant="outline" className="rounded-full bg-transparent border-border text-foreground text-base px-6 py-2 h-auto">
          Aiva AI 2.0
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-7 w-7" />
        </Button>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
        <div className="text-left">
          <h1 className="text-5xl font-bold tracking-tight">How Can I</h1>
          <h1 className="text-5xl font-bold tracking-tight text-primary">Help You Today?</h1>
        </div>

        <Button asChild className="w-full bg-white text-black font-semibold rounded-full h-14 text-lg hover:bg-gray-200">
          <Link href="#">Generate new Prompt</Link>
        </Button>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Prompt Categories</h2>
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                <Link href="#"><ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
              <CategoryCard icon={<Sun size={28} className="text-amber-400"/>} title="Weather" prompts="100 Prompts" />
              <CategoryCard icon={<CalendarDays size={28} className="text-sky-400"/>} title="Schedule" prompts="120 Prompts" />
              <CategoryCard icon={<HeartPulse size={28} className="text-red-400"/>} title="Health" prompts="130 Prompts" />
              <CategoryCard icon={<Film size={28} className="text-indigo-400"/>} title="Entertainment" prompts="140 Prompts" />
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Popular Prompt</h2>
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                <Link href="#"><ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <PopularPrompt text="What's the weather forecast for today?" />
            <PopularPrompt text="How can I maintain good health?" />
            <PopularPrompt text="Explain complex physics concepts" />
            <PopularPrompt text="Any suggestions for a weekend trip?" />
          </div>
        </section>
        
        <section className="mt-4">
            <div className="bg-card p-6 rounded-t-3xl -mx-6">
                <h3 className="text-2xl font-bold">Upgrade to</h3>
            </div>
        </section>
      </main>

      <footer className="bg-black sticky bottom-0 w-full border-t border-gray-800">
        <div className="flex justify-around items-center text-gray-400 py-2">
            <BottomNavItem icon={<LayoutGrid size={28} />} active />
            <BottomNavItem icon={<MessageSquare size={28} />} />
            <BottomNavItem icon={<History size={28} />} />
            <BottomNavItem icon={<User size={28} />} />
        </div>
        <div className="pb-4 pt-1">
            <div className="w-32 h-1.5 bg-white rounded-full mx-auto"></div>
        </div>
      </footer>
    </div>
  );
}
