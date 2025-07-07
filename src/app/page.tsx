import { ArrowRight, Bell, CalendarDays, Check, Film, HeartPulse, History, LayoutGrid, Menu, MessageSquare, Sun, User } from 'lucide-react';
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

const UpgradeCard = ({ planName, price, features, buttonText, isFeatured }: { planName: string, price: string, features: string[], buttonText: string, isFeatured: boolean }) => (
  <div className={`rounded-2xl p-6 w-72 flex-shrink-0 flex flex-col ${isFeatured ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
    <h4 className="text-2xl font-bold">{planName}</h4>
    <p className="text-4xl font-bold my-4">{price}<span className={`text-lg font-normal ${isFeatured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>/month</span></p>
    <ul className="space-y-3 mb-6 flex-1">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3">
          <Check size={18} className={isFeatured ? 'text-primary-foreground' : 'text-primary'}/>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button asChild className={`mt-auto rounded-full h-12 text-base font-semibold ${isFeatured ? 'bg-primary-foreground text-primary hover:bg-gray-200' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
      <Link href="#">{buttonText}</Link>
    </Button>
  </div>
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
        
        <div className="bg-card p-6 rounded-t-3xl -mx-6 mt-auto">
            <h3 className="text-2xl font-bold mb-4">Upgrade to Pro</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <UpgradeCard
                  planName="Pro"
                  price="$10"
                  features={['Unlock All Prompts', 'Unlimited Generations', 'Priority Support']}
                  buttonText="Get Started"
                  isFeatured={false}
                />
                <UpgradeCard
                  planName="Pro Max"
                  price="$20"
                  features={['Unlock All Prompts', 'Unlimited Generations', 'Priority Support', 'Advanced Features']}
                  buttonText="Get Started"
                  isFeatured={true}
                />
            </div>
        </div>
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
