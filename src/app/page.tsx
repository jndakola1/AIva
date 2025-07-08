'use client';
import ChatInterface from "@/components/chat-interface";

export default function Home() {
  return (
    <>
      <header className="p-4 border-b flex items-center">
        <h1 className="text-xl font-semibold">Chat</h1>
      </header>
      <ChatInterface />
    </>
  );
}
