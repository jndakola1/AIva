'use client';

import React from 'react';
import { 
  Mic, 
  ImageIcon, 
  Calendar, 
  Telescope, 
  Eye, 
  Mail, 
  ChevronLeft, 
  MoreHorizontal,
  Sparkles,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Mic,
    category: 'Voice',
    title: 'Audio Live Chat',
    description: 'Talk to AIva in real-time with vision.',
    color: 'bg-orange-500/10 text-orange-500',
    href: '/audio'
  },
  {
    icon: ImageIcon,
    category: 'Image',
    title: 'Image Generation',
    description: 'Create stunning visuals from text.',
    color: 'bg-blue-500/10 text-blue-500',
    href: '/'
  },
  {
    icon: Calendar,
    category: 'Schedule',
    title: 'Smart Planning',
    description: 'Manage alarms and your calendar.',
    color: 'bg-purple-500/10 text-purple-500',
    href: '/'
  },
  {
    icon: Telescope,
    category: 'Research',
    title: 'Deep Synthesis',
    description: 'Perform complex web research.',
    color: 'bg-green-500/10 text-green-500',
    href: '/'
  },
  {
    icon: Eye,
    category: 'Vision',
    title: 'Visual Intel',
    description: 'Describe any scene or image.',
    color: 'bg-pink-500/10 text-pink-500',
    href: '/audio'
  },
  {
    icon: Mail,
    category: 'Inbox',
    title: 'Email Analysis',
    description: 'Summarize your recent messages.',
    color: 'bg-yellow-500/10 text-yellow-500',
    href: '/'
  }
];

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-[#1A1616] text-white">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/5 hover:bg-white/10 text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/5 hover:bg-white/10 text-white"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      {/* Title */}
      <div className="px-8 py-4">
        <h1 className="text-4xl font-semibold tracking-tight">Our features</h1>
      </div>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <button
              key={i}
              onClick={() => router.push(feature.href)}
              className="flex flex-col items-start p-6 rounded-[2.5rem] bg-[#2D2424] hover:bg-[#3D3434] transition-all text-left group border border-white/5 shadow-2xl h-48 md:h-56"
            >
              <div className={cn("p-3 rounded-2xl mb-auto", feature.color)}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
                  {feature.category}
                </p>
                <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {/* Extra Info / Tips */}
        <div className="mt-12 max-w-4xl mx-auto px-2">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Tips & Tricks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <p className="text-sm font-medium text-white/80">Use the "Enhance" button to improve your prompts instantly.</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <Globe className="h-5 w-5 text-green-400" />
                    <p className="text-sm font-medium text-white/80">Switch to Online mode for real-time web research & tools.</p>
                </div>
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <Clock className="h-5 w-5 text-purple-400" />
                    <p className="text-sm font-medium text-white/80">Ask AIva to "Set an alarm" to see your specialized action cards.</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
