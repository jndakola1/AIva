'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleClearHistory = () => {
    // This is a placeholder for now.
    toast({
      title: 'History Cleared',
      description: 'Your conversation history has been cleared.',
    });
  };

  return (
    <>
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
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
              </d   escription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Clear History</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your conversation history. This action cannot be undone.
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
