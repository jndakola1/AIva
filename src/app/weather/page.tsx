import React from 'react';

export default function SettingsPage() {
  return (
    <>
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="mt-2 text-muted-foreground">Application settings will be available here.</p>
        </div>
      </main>
    </>
  );
}
