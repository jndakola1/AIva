'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Camera, FileText, Globe, Image as ImageIcon, Plus, Telescope, Wand2, Film, Music, ChevronRight, Zap } from 'lucide-react';
import type React from 'react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

const ActionButton = ({ icon: Icon, children, onClick }: { icon: React.ElementType, children: React.ReactNode, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 group active:scale-95"
    >
        <div className="flex items-center justify-center h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all shadow-xl">
            <Icon className="h-7 w-7 text-white/40 group-hover:text-primary group-hover:scale-110 transition-all" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{children}</span>
    </button>
);

const MenuLink = ({ icon: Icon, children, detail, onClick, disabled }: { icon: React.ElementType, children: React.ReactNode, detail?: string, onClick?: () => void, disabled?: boolean }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className="flex items-center w-full text-left h-16 text-base font-bold gap-4 px-5 rounded-[1.5rem] hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group active:scale-98 disabled:opacity-30"
    >
        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <Icon className="h-5 w-5 text-white/40 group-hover:text-primary" />
        </div>
        <div className="flex-grow">
          <span className="text-white/80 group-hover:text-white transition-colors">{children}</span>
          {detail && <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mt-0.5">{detail}</p>}
        </div>
        <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </button>
);


const AttachmentMenu = ({ 
  disabled, 
  onGenerateImage,
  onGenerateVideo,
  onGenerateMusic,
  onWebSearch,
  onDeepResearch,
  onDailyBriefing,
  onImageSelect,
  onFileSelect,
}: { 
  disabled?: boolean, 
  onGenerateImage: () => void,
  onGenerateVideo: () => void,
  onGenerateMusic: () => void,
  onWebSearch: () => void,
  onDeepResearch: () => void,
  onDailyBriefing: () => void,
  onImageSelect: (file: File) => void,
  onFileSelect: (file: File) => void,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAction = (action: () => void) => {
    if (disabled) return;
    action();
    setIsOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      setIsOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setIsOpen(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all h-11 w-11" disabled={disabled}>
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="rounded-t-[3rem] bg-[#0A0A0B]/95 backdrop-blur-3xl border-t border-white/10 w-full max-w-xl mx-auto p-8 pb-12 shadow-2xl"
      >
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/10 mb-8" />
        <SheetHeader className="sr-only">
          <SheetTitle>Neural Interface Actions</SheetTitle>
        </SheetHeader>
        
        <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageChange}
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".txt,.pdf,.md,.doc,.docx" 
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-3 gap-6 text-center mb-8 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5">
            <ActionButton icon={Camera} onClick={() => imageInputRef.current?.click()}>Camera</ActionButton>
            <ActionButton icon={ImageIcon} onClick={() => imageInputRef.current?.click()}>Gallery</ActionButton>
            <ActionButton icon={FileText} onClick={() => fileInputRef.current?.click()}>Terminal</ActionButton>
        </div>
        <div className="space-y-1.5">
            <MenuLink icon={Zap} onClick={() => handleAction(onDailyBriefing)} detail="Context Synthesis">Daily Briefing</MenuLink>
            <MenuLink icon={Wand2} onClick={() => handleAction(onGenerateImage)} disabled={disabled}>Pixel Synthesis</MenuLink>
            <MenuLink icon={Film} onClick={() => handleAction(onGenerateVideo)} detail="Veo 3 Pro" disabled={disabled}>Motion Engine</MenuLink>
            <MenuLink icon={Music} onClick={() => handleAction(onGenerateMusic)} detail="Neural Studio" disabled={disabled}>Audio Mastering</MenuLink>
            <MenuLink icon={Globe} onClick={() => handleAction(onWebSearch)} disabled={disabled}>Global Search</MenuLink>
            <MenuLink icon={Telescope} onClick={() => handleAction(onDeepResearch)} detail="Deep Synthesis" disabled={disabled}>Intel Report</MenuLink>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AttachmentMenu;
