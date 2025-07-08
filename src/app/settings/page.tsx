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
import { User } from 'lucide-react';

export default function SettingsPage() {
  const { clearHistory } = useChatHistory();

  // Mock user state for demonstration
  const isLoggedIn = false;

  const handleClearHistory = () => {
    clearHistory();
  };

  return (
    <>
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account and sign-in status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoggedIn ? (
                <div>
                  {/* Logged in state UI to be built here */}
                   <p>Welcome back!</p>
                </div>
              ) : (
                 <div className="flex items-center justify-between p-4 -m-4 rounded-lg bg-muted/30">
                   <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Not Signed In</p>
                        <p className="text-sm text-muted-foreground">Sign in to sync history and preferences.</p>
                      </div>
                   </div>
                   <Button asChild>
                     <Link href="/login">Sign In</Link>
                   </Button>
                 </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                  <span>Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enjoy a darker color scheme.
                  </span>
                </Label>
                <Switch id="dark-mode" defaultChecked={true} disabled />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your conversation data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Clear History</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your conversation history. This
                    action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleClearHistory}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
