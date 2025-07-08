'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ModeIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <Badge variant="outline" className="flex items-center gap-2 border-border/60">
      <div className={cn('h-2 w-2 rounded-full', isOnline ? 'bg-green-500' : 'bg-gray-400')} />
      <span className="text-xs font-medium">
        {isOnline ? 'Online (Gemini Pro)' : 'Offline (Ollama)'}
      </span>
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
    </Badge>
  );
}
