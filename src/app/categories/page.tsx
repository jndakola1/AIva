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
  Clock,
  Film,
  Music,
  Video,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Film,
    category: 'Motion Engine',
    title: 'Cinematic Veo',
    description: 'Generate 4K cinematic videos with spatial sound.',
    color: 'text-red-400 bg-red-400/10 border-red-400/20',
    href: '/'
  },
  {
    icon: Music,
    category: 'Audio Studio',
    title: 'Neural Composing',
    description: 'Create unique soundtracks and spatial audio.',
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    href: '/'
  },
  {
    icon: Mic,
    category: 'Vision Live',
    title: 'Voice Intercept',
    description: 'Real-time video chat with multimodal vision.',
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    href: '/audio'
  },
  {
    icon: ImageIcon,
    category: 'Imaging',
    title: 'Pixel Synthesis',
    description: 'Hyper-realistic visuals from text descriptions.',
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    href: '/'
  },
  {
    icon: Telescope,
    category: 'Analysis',
    title: 'Deep Research',
    description: 'Multi-step web synthesis and report generation.',
    color: 'text-green-400 bg-green-400/10 border-green-400/20',
    href: '/'
  },
  {
    icon: Eye,
    category: 'Perception',
    title: 'Visual Logic',
    description: 'Describe complex scenes and identify objects.',
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    href: '/audio'
  }
];

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <header className="p-8 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground h-12 w-12 border border-foreground/10 shadow-xl"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 px-6">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">Capabilities</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30 mt-1">AIva OS v1.2</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground h-12 w-12 border border-foreground/10 shadow-xl"
        >
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </header>

      {/* Grid */}
      <main className="flex-1 overflow-y-auto p-8 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <button
              key={i}
              onClick={() => router.push(feature.href)}
              className="flex flex-col items-start p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 hover:bg-foreground/[0.06] hover:border-primary/30 transition-all text-left group shadow-2xl h-64 md:h-72 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                  <ChevronRight className="h-6 w-6 text-primary" />
              </div>
              <div className={cn("p-4 rounded-2xl mb-auto border shadow-lg transition-transform group-hover:scale-110", feature.color)}>
                <feature.icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-foreground/30 group-hover:text-primary transition-colors">
                  {feature.category}
                </p>
                <h3 className="text-2xl font-bold leading-tight text-foreground/90 group-hover:text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/40 font-medium leading-relaxed max-w-[200px]">
                    {feature.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Pro Features Section */}
        <div className="mt-20 max-w-7xl mx-auto mb-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-1px flex-1 bg-gradient-to-r from-transparent to-foreground/10" />
                <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                    <Sparkles className="h-5 w-5" />
                    Neural Modules
                </h2>
                <div className="h-1px flex-1 bg-gradient-to-l from-transparent to-foreground/10" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 flex flex-col gap-4 group hover:bg-foreground/[0.04] transition-all">
                    <div className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                        <Video className="h-6 w-6 text-red-400" />
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-relaxed">Veo 3 Pro now synthesizes high-fidelity 4K sequences with spatial audio tracks.</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 flex flex-col gap-4 group hover:bg-foreground/[0.04] transition-all">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Music className="h-6 w-6 text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-relaxed">Compose atmospheric audio loops and neural soundscapes for multimedia projects.</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 flex flex-col gap-4 group hover:bg-foreground/[0.04] transition-all">
                    <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 text-blue-400" />
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-relaxed">Multimodal input terminal now supports direct camera injection and encrypted files.</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}