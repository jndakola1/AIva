import { Bell, CalendarDays, Check, HeartPulse, History, LayoutGrid, Menu, MessageSquare, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const BottomNavItem = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <Button asChild variant="ghost" className={`rounded-full p-3 h-auto ${active ? 'text-white' : 'text-gray-500'} hover:text-white hover:bg-gray-800`}>
    <Link href="#">
      {icon}
    </Link>
  </Button>
);

const CategoryCard = ({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string, href: string }) => (
    <Link href={href} className="block h-full">
        <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors text-white flex flex-col h-full">
            <CardHeader>
                {icon}
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm flex-grow">{description}</p>
            </CardContent>
        </Card>
    </Link>
);

const ProCard = ({ title, price, features, popular = false }: { title: string; price: string; features: string[]; popular?: boolean; }) => (
    <Card className={`bg-gray-900 border-gray-800 text-white flex flex-col ${popular ? 'border-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{title}</h3>
          {popular && <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">POPULAR</div>}
        </div>
        <p className="text-4xl font-bold">{price}<span className="text-base font-normal text-muted-foreground">/ month</span></p>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <ul className="space-y-3 mb-6 flex-grow">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className={`w-full ${popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white text-black hover:bg-gray-200'}`}>
          Upgrade to {title}
        </Button>
      </CardContent>
    </Card>
  );

export default function HomePage() {
    const categories = [
        {
          href: "/weather",
          icon: <Sun className="h-8 w-8 mb-4 text-white" />,
          title: "Weather",
          description: "Get real-time weather forecasts and updates.",
        },
        {
          href: "#",
          icon: <CalendarDays className="h-8 w-8 mb-4 text-white" />,
          title: "Schedule",
          description: "Manage your events, meetings, and plans.",
        },
        {
          href: "#",
          icon: <HeartPulse className="h-8 w-8 mb-4 text-white" />,
          title: "Health",
          description: "Track fitness, nutrition, and well-being.",
        },
    ];

    const proFeatures = [
        "Access to all AI models",
        "Unlimited message history",
        "Faster response times",
        "Priority support",
    ];
    
    const proMaxFeatures = [
        ...proFeatures,
        "Advanced data analysis",
        "Early access to new features",
    ];

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

      <main className="flex-1 px-6 flex flex-col overflow-y-auto no-scrollbar pb-8">
        <div className="text-left py-8">
            <h1 className="text-3xl font-bold">Hello, Guest</h1>
            <p className="text-muted-foreground text-lg">How can I help you today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {categories.map((category) => (
                <CategoryCard key={category.title} {...category} />
            ))}
        </div>

        <div>
            <h2 className="text-2xl font-bold text-center mb-2">Upgrade to Pro</h2>
            <p className="text-muted-foreground text-center mb-8">Unlock more features and enhance your AI experience.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProCard title="Pro" price="$10" features={proFeatures} />
                <ProCard title="Pro Max" price="$20" features={proMaxFeatures} popular />
            </div>
        </div>
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
