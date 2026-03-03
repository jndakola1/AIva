'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useChatHistory } from '@/context/chat-history-context';
import { useSettings } from '@/context/settings-context';
import Link from 'next/link';
import { 
  User, 
  LogOut, 
  Trash2, 
  Palette, 
  Shield, 
  Bot, 
  Smile, 
  BrainCircuit, 
  Settings as SettingsIcon, 
  AlertTriangle, 
  Loader2,
  Sparkles,
  ChevronRight,
  Globe,
  Mail,
  Calendar,
  Cloud,
  ShieldCheck,
  Zap,
  Monitor,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function SettingsSection({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="bg-foreground/[0.02] border-foreground/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">{title}</CardTitle>
            <CardDescription className="text-foreground/40 font-medium">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 pt-4">
        {children}
      </CardContent>
    </Card>
  );
}

const SettingsItem = ({ label, description, children, icon: Icon }: { label: string; description?: string; children: React.ReactNode; icon?: React.ElementType }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[2rem] bg-foreground/[0.03] border border-foreground/5 gap-4 transition-all hover:bg-foreground/[0.05] group">
    <div className="flex items-center gap-4 flex-grow">
      {Icon && (
        <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10 text-foreground/40 group-hover:text-primary transition-all">
            <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-grow">
        <Label className="text-sm font-bold uppercase tracking-widest text-foreground/90">{label}</Label>
        {description && (
          <p className="text-xs text-foreground/40 font-medium mt-1 pr-4 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="w-full sm:w-auto flex-shrink-0 flex justify-end">{children}</div>
  </div>
);

export default function SettingsPage() {
  const { clearHistory, messages } = useChatHistory();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearHistory();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <header className="p-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">Preferences</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30 mt-1">AIva OS v1.2 Core Config</p>
      </header>

      <main className="flex-1 p-8 pt-4 overflow-y-auto no-scrollbar">
        <div className="max-w-4xl mx-auto pb-24">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="flex h-auto p-1.5 bg-foreground/[0.03] border border-foreground/5 rounded-[2rem] mb-12 backdrop-blur-xl overflow-x-auto no-scrollbar justify-start md:justify-center gap-2">
              <TabsTrigger value="account" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
              <TabsTrigger value="integrations" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><Cloud className="w-4 h-4 mr-2" />Neural Cloud</TabsTrigger>
              <TabsTrigger value="personality" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><Smile className="w-4 h-4 mr-2" />Mood</TabsTrigger>
              <TabsTrigger value="system" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><Monitor className="w-4 h-4 mr-2" />Interface</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-8">
               <SettingsSection icon={User} title="User Profile" description="Manage your core identity and linked accounts.">
                  {authLoading ? (
                    <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 animate-pulse">
                      <div className="flex items-center gap-6">
                        <Skeleton className="h-16 w-16 rounded-3xl bg-foreground/5" />
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-40 bg-foreground/5" />
                          <Skeleton className="h-3 w-64 bg-foreground/5" />
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-[1.75rem] bg-primary border-4 border-foreground/10 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                          {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground tracking-tight">{user.displayName || 'Authorized User'}</p>
                          <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest mt-1">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={handleSignOut} className="rounded-2xl h-14 px-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-bold uppercase tracking-widest text-xs">
                        <LogOut className="mr-3 h-4 w-4" />
                        Terminate Session
                      </Button>
                    </div>
                  ) : null}
               </SettingsSection>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-8">
                <SettingsSection icon={Cloud} title="Neural Cloud Sync" description="Synchronize your digital life across terminals.">
                    <p className="text-sm text-foreground/40 p-6">Integration modules are currently active and synced to your neural profile.</p>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="personality" className="space-y-8">
               <SettingsSection icon={Smile} title="Personality Matrix" description="Fine-tune AIva’s behavioral parameters.">
                  <SettingsItem label="Tone Synthesis" description="Adjust the verbal style of the AI assistant." icon={Palette}>
                     <div className="w-64">
                        <Select 
                          value={settings.personality.tone} 
                          onValueChange={(value) => updateSettings('personality', 'tone', value)}
                        >
                          <SelectTrigger className="rounded-2xl bg-foreground/5 border-foreground/10 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly & Warm</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="witty">Sharp & Witty</SelectItem>
                            <SelectItem value="concise">Hyper-Concise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </SettingsItem>
                  <SettingsItem label="Assistant Alias" icon={Bot}>
                     <div className="w-64">
                        <Input 
                            value={settings.personality.name} 
                            onChange={(e) => updateSettings('personality', 'name', e.target.value)}
                            className="bg-foreground/5 border-foreground/10 rounded-2xl h-12 font-bold"
                        />
                     </div>
                  </SettingsItem>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="system" className="space-y-8">
               <SettingsSection icon={Monitor} title="Interface Appearance" description="Customize your visual terminal experience.">
                  <SettingsItem label="System Theme" description="Switch between high-fidelity light and dark neural modes." icon={Palette}>
                     <div className="w-64">
                        <Select 
                          value={settings.appearance.theme} 
                          onValueChange={(value) => updateSettings('appearance', 'theme', value)}
                        >
                          <SelectTrigger className="rounded-2xl bg-foreground/5 border-foreground/10 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Neural Light</SelectItem>
                            <SelectItem value="dark">Deep Dark</SelectItem>
                            <SelectItem value="system">Device Sync</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </SettingsItem>
                  
                  <SettingsItem label="Neural Accent" description="Select your primary high-performance color scheme." icon={Sparkles}>
                     <div className="w-64">
                        <Select 
                          value={settings.appearance.primaryColor} 
                          onValueChange={(value) => updateSettings('appearance', 'primaryColor', value)}
                        >
                          <SelectTrigger className="rounded-2xl bg-foreground/5 border-foreground/10 h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orange">Neural Orange</SelectItem>
                            <SelectItem value="blue">Quantum Blue</SelectItem>
                            <SelectItem value="green">Bio Green</SelectItem>
                            <SelectItem value="purple">Deep Purple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </SettingsItem>
               </SettingsSection>

               <SettingsSection icon={Languages} title="Global Language Terminal" description="Translate the AIva interface into your preferred language.">
                  <div className="p-8 rounded-[2.5rem] bg-foreground/[0.03] border-foreground/5 space-y-6">
                      <div id="google_translate_element" className="relative z-10 p-4 bg-foreground/5 rounded-2xl" />
                  </div>
               </SettingsSection>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
