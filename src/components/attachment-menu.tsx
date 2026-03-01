'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Camera, FileText, Globe, Image as ImageIcon, Plus, Telescope, Wand2, Film, Music } from 'lucide-react';
import type React from 'react';
import { useState, useRef } from 'react';

const ActionButton = ({ icon: Icon, children, onClick }: { icon: React.ElementType, children: React.ReactNode, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
    >
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/60">
            <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{children}</span>
    </button>
);

const MenuLink = ({ icon: Icon, children, detail, onClick, disabled }: { icon: React.ElementType, children: React.ReactNode, detail?: string, onClick?: () => void, disabled?: boolean }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className="flex items-center w-full text-left h-14 text-base font-normal gap-4 px-3 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="flex-grow text-foreground">{children}</span>
        {detail && <span className="text-sm text-muted-foreground">{detail}</span>}
    </button>
);


const AttachmentMenu = ({ 
  disabled, 
  onGenerateImage,
  onGenerateVideo,
  onGenerateMusic,
  onWebSearch,
  onDeepResearch,
  onImageSelect,
  onFileSelect,
}: { 
  disabled?: boolean, 
  onGenerateImage: () => void,
  onGenerateVideo: () => void,
  onGenerateMusic: () => void,
  onWebSearch: () => void,
  onDeepResearch: () => void,
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
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" disabled={disabled}>
          <Plus className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="rounded-t-2xl bg-card border-none w-full max-w-xl mx-auto p-4 sm:p-6"
      >
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
        <SheetHeader className="sr-only">
          <SheetTitle>Attachments & Actions</SheetTitle>
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

        <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <ActionButton icon={Camera} onClick={() => imageInputRef.current?.click()}>Camera</ActionButton>
            <ActionButton icon={ImageIcon} onClick={() => imageInputRef.current?.click()}>Photos</ActionButton>
            <ActionButton icon={FileText} onClick={() => fileInputRef.current?.click()}>Docs</ActionButton>
        </div>
        <div className="space-y-1">
            <MenuLink icon={Wand2} onClick={() => handleAction(onGenerateImage)} disabled={disabled}>Create an image</MenuLink>
            <MenuLink icon={Film} onClick={() => handleAction(onGenerateVideo)} detail="Veo 3 with Sound" disabled={disabled}>Create a video</MenuLink>
            <MenuLink icon={Music} onClick={() => handleAction(onGenerateMusic)} disabled={disabled}>Create music</MenuLink>
            <MenuLink icon={Globe} onClick={() => handleAction(onWebSearch)} disabled={disabled}>Search the web</MenuLink>
            <MenuLink icon={Telescope} onClick={() => handleAction(onDeepResearch)} detail="Quick synthesis" disabled={disabled}>Run deep research</MenuLink>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AttachmentMenu;
