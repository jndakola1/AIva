
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
import { User, LogOut, Trash2, Palette, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="max-w-4xl mx-auto space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <span>Account</span>
              </CardTitle>
              <CardDescription>
                Manage your account and sign-in status. Your settings are synced across devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAccountCard()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="w-6 h-6" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application to your preference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/40">
                <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                  <span className="font-semibold">Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enjoy a color scheme that's easier on the eyes in low light.
                  </span>
                </Label>
                <Switch id="dark-mode" defaultChecked={true} disabled aria-readonly={true} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                 <Shield className="w-6 h-6" />
                <span>Data & Privacy</span>
              </CardTitle>
              <CardDescription>
                Manage your conversation data and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
                <div>
                  <Label className="font-semibold">Clear History</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete all your conversation history. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleClearHistory}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  );
}
