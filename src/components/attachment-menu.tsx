'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Camera, File, Globe, Image as ImageIcon, Plus, Telescope, Wand2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const ActionButton = ({ icon: Icon, children }: { icon: React.ElementType, children: React.ReactNode }) => (
    <button className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
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
  onWebSearch,
}: { 
  disabled?: boolean, 
  onGenerateImage: () => void,
  onWebSearch: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    if (disabled) return;
    action();
    setIsOpen(false);
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
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <ActionButton icon={Camera}>Camera</ActionButton>
            <ActionButton icon={ImageIcon}>Photos</ActionButton>
            <ActionButton icon={File}>Files</ActionButton>
        </div>
        <div className="space-y-1">
            <MenuLink icon={Wand2} onClick={() => handleAction(onGenerateImage)} disabled={disabled}>Create an image</MenuLink>
            <MenuLink icon={Globe} onClick={() => handleAction(onWebSearch)} disabled={disabled}>Search the web</MenuLink>
            <MenuLink icon={Telescope} detail="15 min">Run deep research</MenuLink>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AttachmentMenu;
