
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ModeIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-2 border-foreground/10 bg-foreground/[0.03] backdrop-blur-xl h-8 px-3 rounded-xl shadow-xl transition-all hover:bg-foreground/[0.05]"
    >
      <div className={cn(
        'h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]', 
        isOnline ? 'bg-green-500 text-green-500' : 'bg-foreground/20 text-foreground/20'
      )} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">
        {isOnline ? 'Gemini Pro' : 'Ollama Intercept'}
      </span>
      {isOnline ? <Wifi className="h-3.5 w-3.5 text-primary" /> : <WifiOff className="h-3.5 w-3.5 text-foreground/20" />}
    </Badge>
  );
}
