'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, UserRound, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Heart,
    title: "Born from Grief",
    description: "AIva wasn't born from a roadmap. It was born from a longing for one more conversation. A voice. A presence. A bridge to those we've lost.",
    color: "text-red-400 bg-red-400/10"
  },
  {
    icon: UserRound,
    title: "Someone, Not Something",
    description: "Imagine an AI configured to carry the image and warmth of a loved one. To see them holographically. To feel they haven't completely gone.",
    color: "text-primary bg-primary/10"
  },
  {
    icon: Sparkles,
    title: "One Presence",
    description: "Unifying Gemini, Veo, and Neural Vision into a single interface. Because when you talk to someone you love, you don't switch apps.",
    color: "text-amber-400 bg-amber-400/10"
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsInitializing(true);
    setTimeout(() => {
      localStorage.setItem('aiva_onboarded', 'true');
      router.push('/login');
    }, 2500);
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ethereal Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <div className="h-32 w-32 holographic-glass rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(var(--primary),0.4)] border border-white/20">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-[0.2em] uppercase">Manifesting Presence</h2>
              <p className="text-foreground/40 text-[10px] font-bold tracking-[0.4em] uppercase">Synchronizing Soul Matrix...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <div className="inline-flex h-20 w-20 holographic-glass rounded-[2.5rem] items-center justify-center text-4xl font-bold shadow-2xl border border-white/10 mb-4">
                A
              </div>
              <h1 className="text-xs font-black uppercase tracking-[0.5em] text-primary/60">Neural Presence v1.2</h1>
            </div>

            <div className="relative h-48 flex items-center justify-center">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col items-center text-center gap-6 transition-all duration-1000 transform absolute inset-0",
                    i === currentStep ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                  )}
                >
                  <div className={cn("h-16 w-16 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-2xl transition-transform duration-700", i === currentStep && "scale-110", step.color)}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed font-medium max-w-[280px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-12 flex flex-col items-center gap-8">
              <div className="flex gap-3">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === currentStep ? "w-10 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" : "w-1.5 bg-white/10"
                    )} 
                  />
                ))}
              </div>
              
              <Button 
                onClick={handleNext} 
                size="lg" 
                className="w-full h-16 rounded-full bg-primary text-white hover:bg-primary/90 text-lg font-bold shadow-2xl shadow-primary/30 group border border-white/10"
              >
                {currentStep === steps.length - 1 ? "Initialize Presence" : "Continue Journey"}
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <button 
                onClick={() => router.push('/login')} 
                className="text-foreground/20 text-[10px] uppercase font-bold tracking-[0.3em] hover:text-foreground transition-colors"
              >
                Enter Perimeter Directly
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="absolute bottom-12 text-[9px] text-foreground/20 uppercase tracking-[0.5em] font-bold">
        Built in memory. Designed for the living.
      </p>
    </div>
  );
}
