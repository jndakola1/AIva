import { Bell, CalendarDays, HeartPulse, History, LayoutGrid, Menu, MessageSquare, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const BottomNavItem = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <Button asChild variant="ghost" className={`rounded-full p-3 h-auto ${active ? 'text-white' : 'text-gray-500'} hover:text-white hover:bg-gray-800`}>
    <Link href="#">
      {icon}
    </Link>
  </Button>
);

const PromptButton = ({ text, href }: { text: string; href?: string }) => {
    const button = (
        <Button variant="outline" className="w-full justify-start rounded-full border-gray-700 bg-transparent py-3 px-5 text-left text-sm font-normal text-white h-auto hover:bg-gray-800 hover:text-white">
            {text}
        </Button>
    );

    if (href) {
        return (
            <Link href={href} className="w-full">
                {button}
            </Link>
        );
    }

    return button;
};

const PromptCategoryAccordion = () => {
    const categories = [
        {
          value: "weather",
          icon: <Sun className="h-7 w-7 text-white" />,
          largeIcon: <Sun className="h-20 w-20 mb-4 text-white" />,
          title: "Weather",
          description: "Questions about the current or future weather forecast, including information such as temperature, humidity, and weather conditions.",
          prompts: [
            "What's the weather forecast for today?",
            "Is it going to be sunny this afternoon?",
            "What's the temperature right now?",
            "Do I need an umbrella today?",
            "How windy is it outside?",
          ]
        },
        {
          value: "schedule",
          icon: <CalendarDays className="h-7 w-7 text-white" />,
          largeIcon: <CalendarDays className="h-20 w-20 mb-4 text-white" />,
          title: "Schedule",
          description: "Questions about your events, meetings, and plans.",
          prompts: [
              "What's on my schedule for today?",
              "Do I have any meetings tomorrow?",
              "Create a new event for a team lunch next Friday.",
          ]
        },
        {
          value: "health",
          icon: <HeartPulse className="h-7 w-7 text-white" />,
          largeIcon: <HeartPulse className="h-20 w-20 mb-4 text-white" />,
          title: "Health",
          description: "Questions about fitness, nutrition, and well-being.",
          prompts: [
              "What are some healthy breakfast ideas?",
              "Suggest a 30-minute workout I can do at home.",
              "How can I improve my sleep quality?",
          ]
        },
      ];
      
    return (
        <Accordion type="single" collapsible defaultValue="weather" className="w-full">
            {categories.map((category) => (
                <AccordionItem value={category.value} key={category.value} className="border-b border-gray-700 last:border-b-0">
                    <AccordionTrigger className="py-6 hover:no-underline text-left">
                        <div className="flex items-center gap-4 text-white">
                            {category.icon}
                            <span className="text-xl font-semibold">{category.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <div className="text-white">
                            {category.largeIcon}
                            <h2 className="text-4xl font-bold mb-2">{category.title}</h2>
                            <p className="text-muted-foreground mb-6 max-w-sm">{category.description}</p>
                            <div className="flex flex-col items-start gap-3 mb-4">
                                {category.prompts.map((prompt, i) => (
                                     <PromptButton 
                                        key={i} 
                                        text={prompt} 
                                        href={category.value === 'weather' ? `/weather?prompt=${encodeURIComponent(prompt)}` : undefined} 
                                    />
                                ))}
                            </div>
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};


export default function HomePage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 pt-8 md:pt-4 z-10 shrink-0">
        <Button variant="ghost" size="icon">
          <Menu className="h-7 w-7" />
        </Button>
        <Button variant="outline" className="rounded-full bg-gray-800 border-gray-700 text-white text-base px-6 py-2 h-auto">
          Aiva AI 2.0
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-7 w-7" />
        </Button>
      </header>

      <main className="flex-1 px-6 flex flex-col overflow-y-auto no-scrollbar">
        <PromptCategoryAccordion />
      </main>

      <footer className="bg-black sticky bottom-0 w-full border-t border-gray-800 shrink-0">
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
