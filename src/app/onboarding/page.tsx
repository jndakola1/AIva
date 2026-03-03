
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Shield, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Bot,
    title: "Neural Core",
    description: "Welcome to AIva. I am your high-performance multimodal companion, powered by Gemini 2.5.",
    color: "text-primary bg-primary/10"
  },
  {
    icon: Sparkles,
    title: "Creative Synthesis",
    description: "Unlock cinematic motion with Veo 3.0 and atmospheric mastering with the Neural Audio Studio.",
    color: "text-amber-400 bg-amber-400/10"
  },
  {
    icon: Shield,
    title: "Secure Terminal",
    description: "Your data is siloed in your own Neural Cloud, secured by military-grade Firebase encryption.",
    color: "text-blue-400 bg-blue-400/10"
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
    // Simulate neural initialization
    setTimeout(() => {
      localStorage.setItem('aiva_onboarded', 'true');
      router.push('/login');
    }, 2000);
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="h-24 w-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(217,119,87,0.5)]">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter uppercase">Initializing Core</h2>
              <p className="text-foreground/40 text-xs font-bold tracking-[0.3em] uppercase">Synchronizing Neural Tiers...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center text-3xl font-bold shadow-2xl">
                A
              </div>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-6 transition-all duration-700 transform",
                    i === currentStep ? "opacity-100 translate-x-0" : "opacity-20 scale-95 blur-sm pointer-events-none absolute inset-0"
                  )}
                >
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-xl", step.color)}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-col items-center gap-6">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-white/20"
                    )} 
                  />
                ))}
              </div>
              
              <Button 
                onClick={handleNext} 
                size="lg" 
                className="w-full h-16 rounded-[2rem] bg-primary text-white hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20 group"
              >
                {currentStep === steps.length - 1 ? "Initialize AIva" : "Continue Synthesis"}
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <button 
                onClick={() => router.push('/login')} 
                className="text-foreground/30 text-[10px] uppercase font-bold tracking-widest hover:text-foreground transition-colors"
              >
                Skip System Setup
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="absolute bottom-8 text-[10px] text-foreground/20 uppercase tracking-[0.4em] font-bold">
        Neural Glass OS v1.2 Active
      </p>
    </div>
  );
}
