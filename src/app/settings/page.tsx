'use client';

import { useState, useEffect } from 'react';
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
import Link from 'next/link';
import { 
  User, 
  LogOut, 
  Trash2, 
  Palette, 
  Shield, 
  Bot, 
  Mic, 
  Smile, 
  BrainCircuit, 
  VenetianMask, 
  Settings as SettingsIcon, 
  AlertTriangle, 
  Loader2,
  Volume2,
  Zap,
  Fingerprint,
  Sparkles,
  ChevronRight,
  Globe,
  Mail,
  Calendar,
  Cloud,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_SETTINGS, type UserSettings, updateUserSettings } from '@/lib/user-settings';
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
    <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-grow">
            <CardTitle className="text-xl font-bold tracking-tight text-white">{title}</CardTitle>
            <CardDescription className="text-white/40 font-medium">{description}</CardDescription>
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
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 gap-4 transition-all hover:bg-white/[0.05] group">
    <div className="flex items-center gap-4 flex-grow">
      {Icon && (
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40 group-hover:text-primary group-hover:bg-primary/5 transition-all">
            <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-grow">
        <Label className="text-sm font-bold uppercase tracking-widest text-white/90">{label}</Label>
        {description && (
          <p className="text-xs text-white/40 font-medium mt-1 pr-4 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="w-full sm:w-auto flex-shrink-0 flex justify-end">{children}</div>
  </div>
);

const IntegrationCard = ({ icon: Icon, name, description, connected }: { icon: React.ElementType, name: string, description: string, connected: boolean }) => (
    <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col gap-4 group hover:bg-white/[0.05] transition-all">
        <div className="flex items-center justify-between">
            <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                <Icon className={cn("h-7 w-7 transition-all group-hover:scale-110", connected ? "text-primary" : "text-white/20")} />
            </div>
            <Switch checked={connected} className="data-[state=checked]:bg-primary" />
        </div>
        <div>
            <p className="text-lg font-bold text-white">{name}</p>
            <p className="text-xs text-white/40 font-medium mt-1">{description}</p>
        </div>
        <Button variant="ghost" className="w-full h-11 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest">
            Configure Intercept
        </Button>
    </div>
);

export default function SettingsPage() {
  const { clearHistory, messages } = useChatHistory();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const settingsRef = doc(db, 'users', user.uid, 'settings');
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const dbSettings = docSnap.data();
          setSettings({
            ...DEFAULT_SETTINGS,
            ...dbSettings,
            personality: {
              ...DEFAULT_SETTINGS.personality,
              ...(dbSettings.personality || {})
            }
          });
        }
      };
      fetchHistory();
    }
  }, [user]);

  const handlePersonalityChange = async (key: keyof UserSettings['personality'], value: any) => {
    if (!user) return;

    setIsSaving(true);
    const updatedPersonality = { ...settings.personality, [key]: value };
    const updatedSettings = { ...settings, personality: updatedPersonality };
    setSettings(updatedSettings);

    try {
      await updateUserSettings(user.uid, { personality: updatedPersonality });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sync Error',
        description: 'Failed to update preferences on terminal.',
      });
    } finally {
      setIsSaving(false);
    }
  }

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
    <div className="flex flex-col h-full bg-[#0A0A0B] text-white">
      <header className="p-8 pb-4 flex items-center justify-between bg-gradient-to-b from-black/20 to-transparent">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Preferences</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 mt-1">AIva OS v1.2 Core Config</p>
        </div>
        {isSaving && <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing...
        </div>}
      </header>

      <main className="flex-1 p-8 pt-4 overflow-y-auto no-scrollbar">
        <div className="max-w-4xl mx-auto pb-24">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="flex h-auto p-1.5 bg-white/[0.03] border border-white/5 rounded-[2rem] mb-12 backdrop-blur-xl overflow-x-auto no-scrollbar justify-start md:justify-center gap-2">
              <TabsTrigger value="account" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
              <TabsTrigger value="integrations" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><Cloud className="w-4 h-4 mr-2" />Neural Cloud</TabsTrigger>
              <TabsTrigger value="personality" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><Smile className="w-4 h-4 mr-2" />Mood</TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-2xl py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl"><Zap className="w-4 h-4 mr-2" />Neural Core</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SettingsSection icon={User} title="User Profile" description="Manage your core identity and linked accounts.">
                  {authLoading ? (
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 animate-pulse">
                      <div className="flex items-center gap-6">
                        <Skeleton className="h-16 w-16 rounded-3xl bg-white/5" />
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-40 bg-white/5" />
                          <Skeleton className="h-3 w-64 bg-white/5" />
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-6 relative">
                        <div className="h-20 w-20 rounded-[1.75rem] bg-primary border-4 border-white/10 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-primary/20">
                          {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white tracking-tight">{user.displayName || 'Authorized User'}</p>
                          <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-1">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={handleSignOut} className="rounded-2xl h-14 px-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 font-bold uppercase tracking-widest text-xs relative">
                        <LogOut className="mr-3 h-4 w-4" />
                        Terminate Session
                      </Button>
                    </div>
                  ) : (
                    <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-center space-y-6">
                      <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                        <SettingsIcon className="h-10 w-10 text-white/20" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-white">Guest Access Detected</p>
                        <p className="text-sm text-white/40 max-w-sm mx-auto">Sign in to sync your AIva neural settings and conversation history across all terminals.</p>
                      </div>
                      <Button asChild className="rounded-[1.5rem] h-14 px-10 bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        <Link href="/login">Authenticate Terminal</Link>
                      </Button>
                    </div>
                  )}
               </SettingsSection>

               <SettingsSection icon={Shield} title="Neural Storage" description="Global data retention and privacy protocols.">
                  <SettingsItem label="Wipe All Core Memory" description="Permanently delete all conversation logs and learned interactions. This operation is irreversible." icon={Trash2}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="rounded-2xl h-12 px-6 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 font-bold uppercase tracking-widest text-[10px]" disabled={!user || messages.length === 0}>
                          Initiate Wipe
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2.5rem] bg-[#0A0A0B]/95 backdrop-blur-3xl border border-white/10 p-8 shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-3 text-white text-2xl font-bold tracking-tight">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            Confirm Terminal Wipe?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60 font-medium leading-relaxed mt-4">
                            You are about to initiate a full memory purge. This will permanently erase all interaction data from the AIva cloud terminal.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-4">
                          <AlertDialogCancel className="rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] bg-white/5 border-white/10 text-white">Abort</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearHistory} 
                            className="rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isClearing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Execute Purge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SettingsItem>
               </SettingsSection>
            </TabsContent>

            <TabsContent value="integrations" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingsSection icon={Cloud} title="Neural Cloud Sync" description="Synchronize your digital life across specialized AIva terminals.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <IntegrationCard icon={Mail} name="Intelligence Comm" description="Synthesize emails and high-priority messages." connected={true} />
                        <IntegrationCard icon={Calendar} name="Schedule Sync" description="Automatic event synthesis and agenda mapping." connected={true} />
                        <IntegrationCard icon={Zap} name="Terminal Tasks" description="Sync actions items and neural to-do lists." connected={true} />
                        <IntegrationCard icon={ShieldCheck} name="Biometric Auth" description="Multi-step validation for sensitive data." connected={false} />
                    </div>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="personality" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SettingsSection icon={Smile} title="Personality Matrix" description="Fine-tune AIva’s behavioral parameters and vocal tone.">
                  <SettingsItem label="Tone Synthesis" description="Adjust the verbal style of the AI assistant." icon={Palette}>
                     <div className="w-full sm:w-64">
                        <Select 
                          value={settings.personality.tone} 
                          onValueChange={(value) => handlePersonalityChange('tone', value)}
                          disabled={!user || isSaving}
                        >
                          <SelectTrigger className="rounded-2xl bg-white/5 border-white/10 text-white font-bold h-12 focus:ring-primary/40">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#161618]/95 backdrop-blur-2xl border-white/10 rounded-2xl">
                            <SelectItem value="friendly" className="text-white hover:bg-white/5 cursor-pointer rounded-xl">Friendly & Warm</SelectItem>
                            <SelectItem value="professional" className="text-white hover:bg-white/5 cursor-pointer rounded-xl">Executive & Professional</SelectItem>
                            <SelectItem value="witty" className="text-white hover:bg-white/5 cursor-pointer rounded-xl">Sharp & Witty</SelectItem>
                            <SelectItem value="concise" className="text-white hover:bg-white/5 cursor-pointer rounded-xl">Hyper-Concise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </SettingsItem>
                  <SettingsItem label="Wit & Humor" description="Toggle AIva’s ability to utilize humor and metaphors." icon={Sparkles}>
                    <Switch 
                      checked={settings.personality.enableHumor} 
                      onCheckedChange={(checked) => handlePersonalityChange('enableHumor', checked)}
                      disabled={!user || isSaving}
                      className="data-[state=checked]:bg-primary"
                    />
                  </SettingsItem>
                  <SettingsItem label="Assistant Alias" description="The primary name AIva uses to identify itself." icon={Bot}>
                     <div className="w-full sm:w-64 relative group">
                        <Input 
                            value={settings.personality.name} 
                            onChange={(e) => handlePersonalityChange('name', e.target.value)}
                            className="bg-white/5 border-white/10 rounded-2xl h-12 text-white font-bold px-4 focus-visible:ring-primary/40"
                            placeholder="AIva"
                            disabled={!user || isSaving}
                        />
                        <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                     </div>
                  </SettingsItem>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="intelligence" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingsSection icon={BrainCircuit} title="Neural Engine" description="Manage the high-performance AI models powering the terminal.">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white">Gemini Pro 2.0</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Ultra-Performance Core</p>
                            </div>
                            <Badge className="ml-auto bg-primary text-white font-bold border-none h-7 px-3">ACTIVE</Badge>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-medium">Currently utilizing the Gemini Ultra core for complex reasoning, image analysis, and deep synthesis tasks. Offline mode utilizes Llama 3 via local intercept.</p>
                        <div className="pt-4 border-t border-white/5">
                            <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] group">
                                Model Benchmark Report
                                <ChevronRight className="h-4 w-4 text-white/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </Button>
                        </div>
                    </div>
                </SettingsSection>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
