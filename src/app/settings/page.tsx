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
import { User, LogOut, Trash2, Palette, Shield, Bot, Mic, Smile, BrainCircuit, VenetianMask, Settings as SettingsIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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


function SettingsSection({ icon: Icon, title, description, children, }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode; }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Icon className="w-6 h-6 text-primary" />
          <div className="flex-grow">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {children}
      </CardContent>
    </Card>
  );
}

const SettingsItem = ({ label, description, children, }: { label: string; description?: string; children: React.ReactNode; }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 gap-4">
    <div className="flex-grow">
      <Label className="text-base font-semibold">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 pr-4">
          {description}
        </p>
      )}
    </div>
    <div className="w-full sm:w-48 flex-shrink-0">{children}</div>
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
      fetchSettings();
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
        title: 'Error Saving Settings',
        description: 'Your changes could not be saved.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
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
    <>
      <header className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20 md:pb-0">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto mb-8 p-1 bg-muted/50 rounded-2xl">
              <TabsTrigger value="account" className="rounded-xl py-2.5"><User className="w-4 h-4 mr-2" />Account</TabsTrigger>
              <TabsTrigger value="voice" className="rounded-xl py-2.5"><Mic className="w-4 h-4 mr-2" />Voice</TabsTrigger>
              <TabsTrigger value="personality" className="rounded-xl py-2.5"><Smile className="w-4 h-4 mr-2" />Mood</TabsTrigger>
              <TabsTrigger value="intelligence" className="rounded-xl py-2.5"><BrainCircuit className="w-4 h-4 mr-2" />AI</TabsTrigger>
              <TabsTrigger value="identity" className="rounded-xl py-2.5"><VenetianMask className="w-4 h-4 mr-2" />Identity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <SettingsSection icon={User} title="Account" description="Manage your account profile and connected services.">
                  {authLoading ? (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-bold">{user.displayName || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleSignOut} className="rounded-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-muted/30 text-center space-y-4">
                      <p className="text-muted-foreground">You are currently using AIva as a guest.</p>
                      <Button asChild className="rounded-full">
                        <Link href="/login">Sign In to Sync</Link>
                      </Button>
                    </div>
                  )}
               </SettingsSection>

               <SettingsSection icon={Shield} title="Privacy & Data" description="Control how your data is handled and stored.">
                  <SettingsItem label="Clear All History" description="Permanently delete all conversation history with AIva. This cannot be undone.">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto rounded-full" disabled={!user || messages.length === 0}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete History
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Are you sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will wipe all your conversations from our servers. You won't be able to recover them later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearHistory} 
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SettingsItem>
               </SettingsSection>
            </TabsContent>

            <TabsContent value="personality" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <SettingsSection icon={Smile} title="Personality" description="Adjust AIva’s tone and behavior to match your mood.">
                  <SettingsItem label="Tone" description="How AIva speaks to you.">
                     <div className="w-full sm:w-48">
                        <Select 
                          value={settings.personality.tone} 
                          onValueChange={(value) => handlePersonalityChange('tone', value)}
                          disabled={!user || isSaving}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="witty">Witty</SelectItem>
                            <SelectItem value="concise">Concise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </SettingsItem>
                  <SettingsItem label="Enable Humor" description="Allows AIva to use jokes and wit.">
                    <Switch 
                      checked={settings.personality.enableHumor} 
                      onCheckedChange={(checked) => handlePersonalityChange('enableHumor', checked)}
                      disabled={!user || isSaving}
                    />
                  </SettingsItem>
                </SettingsSection>
            </TabsContent>
            
            {/* ... Other Tabs remain identical but with updated styling if needed ... */}
          </Tabs>
        </div>
      </main>
    </>
  );
}
