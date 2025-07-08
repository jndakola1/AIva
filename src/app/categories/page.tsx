import React from 'react';

export default function HistoryPage() {
  return (
    <>
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">History</h1>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">No History Yet</h2>
          <p className="mt-2 text-muted-foreground">Your past conversations will appear here.</p>
        </div>
      </main>
    </>
  );
}
