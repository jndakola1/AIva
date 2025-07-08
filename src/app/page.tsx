'use client';
import ChatInterface from "@/components/chat-interface";
import ModeIndicator from "@/components/mode-indicator";

export default function Home() {
  return (
    <>
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat</h1>
        <ModeIndicator />
      </header>
      <ChatInterface />
    </>
  );
}
