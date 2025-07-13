
'use client';

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
import { User, LogOut, Trash2, Palette, Shield, Bot, Mic, Smile, BrainCircuit, VenetianMask, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SettingsSection({ icon: Icon, title, description, children, }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode; }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Icon className="w-6 h-6" />
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
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-muted/40 gap-4">
    <div className="flex-grow">
      <Label className="text-base font-semibold">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 pr-4">
          {description}
        </p>
      )}
    </div>
    <div className="w-full sm:w-auto flex-shrink-0">{children}</div>
  </div>
);


export default function SettingsPage() {
  const { clearHistory } = useChatHistory();
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleClearHistory = () => {
    clearHistory();
    // Optionally add a toast notification here
  };

  const renderAccountCard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      );
    }
    
    if (user) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">{user.displayName || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      );
    }

    return (
       <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-muted">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold">Not Signed In</p>
            <p className="text-sm text-muted-foreground">Sign in to sync history and preferences.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  };

  return (
    <>
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto mb-6">
              <TabsTrigger value="account"><User className="w-4 h-4 mr-2" />Account</TabsTrigger>
              <TabsTrigger value="voice"><Mic className="w-4 h-4 mr-2" />Voice & Speech</TabsTrigger>
              <TabsTrigger value="personality"><Smile className="w-4 h-4 mr-2" />Personality</TabsTrigger>
              <TabsTrigger value="intelligence"><BrainCircuit className="w-4 h-4 mr-2" />Intelligence</TabsTrigger>
              <TabsTrigger value="identity"><VenetianMask className="w-4 h-4 mr-2" />Identity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-8">
               <SettingsSection icon={User} title="Account" description="Manage your account, sign-in status, and associated services.">
                 {renderAccountCard()}
               </SettingsSection>
               <SettingsSection icon={Palette} title="Appearance" description="Customize the look and feel of the application to your preference.">
                  <SettingsItem label="Dark Mode" description="Enjoy a color scheme that's easier on the eyes in low light.">
                    <Switch id="dark-mode" defaultChecked={true} disabled aria-readonly={true} />
                  </SettingsItem>
               </SettingsSection>
               <SettingsSection icon={Shield} title="Data & Privacy" description="Manage your conversation data and privacy settings.">
                  <SettingsItem label="Clear History" description="Permanently delete all your conversation history. This action cannot be undone.">
                    <Button variant="destructive" onClick={handleClearHistory}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear History
                    </Button>
                  </SettingsItem>
               </SettingsSection>
            </TabsContent>

            <TabsContent value="voice">
              <SettingsSection icon={Mic} title="Voice & Speech" description="Customize input/output voice, TTS, mic sensitivity and more.">
                <SettingsItem label="Input Sensitivity" description="Adjust how sensitive the microphone is to your voice.">
                  <div className="w-full sm:w-48 flex items-center gap-4">
                    <Slider defaultValue={[80]} max={100} step={1} />
                  </div>
                </SettingsItem>
                <SettingsItem label="Output Voice" description="Select the voice Aiva uses to respond.">
                  <div className="w-full sm:w-48">
                    <Select defaultValue="female_en_us_1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female_en_us_1">Female (US English)</SelectItem>
                        <SelectItem value="male_en_us_1">Male (US English)</SelectItem>
                        <SelectItem value="female_en_gb_1">Female (British English)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SettingsItem>
                <SettingsItem label="Speech Rate" description="Control how fast Aiva speaks.">
                  <div className="w-full sm:w-48 flex items-center gap-4">
                    <Slider defaultValue={[1]} max={2} step={0.1} />
                  </div>
                </SettingsItem>
              </SettingsSection>
            </TabsContent>
            
            <TabsContent value="personality">
               <SettingsSection icon={Smile} title="Personality" description="Adjust AIva’s tone, mood, and behavior to match your preference.">
                  <SettingsItem label="Tone" description="Set the overall tone of Aiva's responses.">
                     <div className="w-full sm:w-48">
                        <Select defaultValue="friendly">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
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
                  <SettingsItem label="Enable Humor" description="Allows Aiva to use humor and wit in conversations.">
                    <Switch defaultChecked={true} />
                  </SettingsItem>
                  <SettingsItem label="Emotion Recognition" description="Allows Aiva to recognize and adapt to your emotions during chat.">
                    <Switch defaultChecked={true} />
                  </SettingsItem>
                </SettingsSection>
            </TabsContent>

            <TabsContent value="intelligence">
              <SettingsSection icon={BrainCircuit} title="Intelligence" description="Control model behavior, review settings, and knowledge scope.">
                <SettingsItem label="Primary Model" description="Choose the main AI model for responses.">
                  <div className="w-full sm:w-48">
                    <Select defaultValue="gemini-pro">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SettingsItem>
                <SettingsItem label="Enable Self-Review" description="Aiva will review its own responses for quality and accuracy.">
                  <Switch defaultChecked={true} />
                </SettingsItem>
                 <SettingsItem label="Offline Fallback" description="Use a local model (Ollama) when you're not connected to the internet.">
                  <Switch defaultChecked={true} />
                </SettingsItem>
              </SettingsSection>
            </TabsContent>

            <TabsContent value="identity">
              <SettingsSection icon={VenetianMask} title="Identity & Avatar" description="Manage Aiva's avatar, name, and hardware-related controls.">
                <SettingsItem label="Nickname" description="Give Aiva a custom name.">
                  <div className="w-full sm:w-48">
                    <Input defaultValue="Aiva" />
                  </div>
                </SettingsItem>
                <SettingsItem label="Avatar Type" description="Choose the visual representation for Aiva.">
                  <div className="w-full sm:w-48">
                    <Select defaultValue="floating-orb">
                      <SelectTrigger>
                        <SelectValue placeholder="Select avatar type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floating-orb">Floating Orb</SelectItem>
                        <SelectItem value="humanoid-3d">3D Humanoid</SelectItem>
                        <SelectItem value="hologram">Hologram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </SettingsItem>
                <SettingsItem label="Enable Holographic Control" description="Allow Aiva to interact with connected holographic hardware.">
                  <Switch />
                </SettingsItem>
              </SettingsSection>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </>
  );
}
